package com.thanhpham.product_idea_validator.idea.controller;

import com.thanhpham.product_idea_validator.idea.DTO.response.PublicIdeaResponse;
import com.thanhpham.product_idea_validator.idea.exception.IdeaNotFoundException;
import com.thanhpham.product_idea_validator.idea.mapper.IdeaMapper;
import com.thanhpham.product_idea_validator.idea.repository.IdeaRepository;
import com.thanhpham.product_idea_validator.model.Idea;
import com.thanhpham.product_idea_validator.model.IdeaVersion;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicIdeaController {

    private final IdeaRepository ideaRepository;
    private final IdeaMapper ideaMapper;

    // GET /api/v1/public/{shareToken} — no auth required
    @GetMapping("/{shareToken}")
    @Transactional(readOnly = true)
    public ResponseEntity<PublicIdeaResponse> getByShareToken(
            @PathVariable String shareToken) {

        Idea idea = ideaRepository.findByShareToken(shareToken)
                .orElseThrow(IdeaNotFoundException::new);

        if (!idea.getIsPublic()) {
            // Token exists but sharing was revoked — treat as not found
            return ResponseEntity.notFound().build();
        }

        IdeaVersion latest = idea.getVersions().isEmpty()
                ? null
                : idea.getVersions().get(idea.getVersions().size() - 1);

        List<String> tagNames = idea.getIdeaTags().stream()
                .map(it -> it.getTag().getName())
                .toList();

        PublicIdeaResponse body = new PublicIdeaResponse(
                idea.getTitle(),
                latest != null ? ideaMapper.toVersionResponse(latest) : null,
                tagNames);

        return ResponseEntity.ok(body);
    }
}