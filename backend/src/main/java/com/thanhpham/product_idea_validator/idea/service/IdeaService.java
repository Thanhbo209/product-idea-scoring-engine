package com.thanhpham.product_idea_validator.idea.service;

import com.thanhpham.product_idea_validator.idea.DTO.request.CreateIdeaRequest;
import com.thanhpham.product_idea_validator.idea.DTO.request.UpdateIdeaRequest;
import com.thanhpham.product_idea_validator.idea.DTO.response.IdeaDetailResponse;
import com.thanhpham.product_idea_validator.idea.DTO.response.IdeaSummaryResponse;
import com.thanhpham.product_idea_validator.idea.exception.AccessDeniedException;
import com.thanhpham.product_idea_validator.idea.exception.IdeaNotFoundException;
import com.thanhpham.product_idea_validator.idea.exception.InvalidStateTransitionException;
import com.thanhpham.product_idea_validator.idea.mapper.IdeaMapper;
import com.thanhpham.product_idea_validator.idea.repository.IdeaRepository;
import com.thanhpham.product_idea_validator.model.Idea;
import com.thanhpham.product_idea_validator.user.model.User;
import com.thanhpham.product_idea_validator.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdeaService {

    private final IdeaRepository ideaRepository;
    private final UserRepository userRepository;
    private final IdeaMapper ideaMapper;

    // ── CREATE ──────────────────────────────────────────────────────────────

    @Transactional
    public IdeaDetailResponse create(CreateIdeaRequest req, UUID userId) {
        User user = userRepository.getReferenceById(userId);

        Idea idea = Idea.builder()
                .user(user)
                .title(req.title())
                .status(Idea.Status.DRAFT)
                .isPublic(false)
                .build();

        return ideaMapper.toDetailResponse(ideaRepository.save(idea));
    }

    // ── READ ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<IdeaSummaryResponse> findAll(UUID userId, Idea.Status status, Pageable pageable) {
        Page<Idea> page = (status != null)
                ? ideaRepository.findAllByUserIdAndStatus(userId, status, pageable)
                : ideaRepository.findAllByUserId(userId, pageable);

        return page.map(ideaMapper::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public IdeaDetailResponse findById(UUID ideaId, UUID userId) {
        Idea idea = getAndAssertOwner(ideaId, userId);
        return ideaMapper.toDetailResponse(idea);
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────

    @Transactional
    public IdeaDetailResponse update(UUID ideaId, UpdateIdeaRequest req, UUID userId) {
        Idea idea = getAndAssertOwner(ideaId, userId);

        if (req.title() != null) {
            idea.setTitle(req.title());
        }

        if (req.status() != null) {
            transitionStatus(idea, req.status());
        }

        if (req.isPublic() != null) {
            idea.setIsPublic(req.isPublic());
            // Revoke token when turning off public
            if (!req.isPublic()) {
                idea.setShareToken(null);
            }
        }

        return ideaMapper.toDetailResponse(ideaRepository.save(idea));
    }

    // ── DELETE ───────────────────────────────────────────────────────────────

    @Transactional
    public void delete(UUID ideaId, UUID userId) {
        Idea idea = getAndAssertOwner(ideaId, userId);

        if (idea.getStatus() != Idea.Status.DRAFT) {
            throw new IllegalStateException("Only DRAFT ideas can be deleted");
        }

        boolean hasPendingEvaluation = idea.getVersions().stream()
                .anyMatch(v -> {
                    EvaluationStatus status = ideaMapper.deriveStatus(v);
                    return status == EvaluationStatus.PENDING;
                });

        if (hasPendingEvaluation) {
            throw new IllegalStateException("Cannot delete idea while AI evaluation is in progress");
        }

        ideaRepository.delete(idea);
    }

    // ── SHARE ─────────────────────────────────────────────────────────────────

    @Transactional
    public IdeaDetailResponse enableShare(UUID ideaId, UUID userId) {
        Idea idea = getAndAssertOwner(ideaId, userId);

        if (idea.getShareToken() == null) {
            // Regenerate if token collision (extremely rare)
            String token;
            do {
                token = UUID.randomUUID().toString().replace("-", "");
            } while (ideaRepository.existsByShareToken(token));

            idea.setShareToken(token);
        }

        idea.setIsPublic(true);
        return ideaMapper.toDetailResponse(ideaRepository.save(idea));
    }

    @Transactional
    public void disableShare(UUID ideaId, UUID userId) {
        Idea idea = getAndAssertOwner(ideaId, userId);
        idea.setIsPublic(false);
        idea.setShareToken(null);
        ideaRepository.save(idea);
    }

    // ── INTERNAL ──────────────────────────────────────────────────────────────

    public Idea getAndAssertOwner(UUID ideaId, UUID userId) {
        Idea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new IdeaNotFoundException(ideaId));

        if (!idea.getUser().getId().equals(userId)) {
            throw new AccessDeniedException();
        }

        return idea;
    }

    private void transitionStatus(Idea idea, Idea.Status target) {
        Idea.Status current = idea.getStatus();

        boolean allowed = switch (current) {
            case DRAFT -> target == Idea.Status.ACTIVE || target == Idea.Status.ARCHIVED;
            case ACTIVE -> target == Idea.Status.ARCHIVED;
            case ARCHIVED -> false;
        };

        if (!allowed) {
            throw new InvalidStateTransitionException(current, target);
        }

        idea.setStatus(target);
    }
}
