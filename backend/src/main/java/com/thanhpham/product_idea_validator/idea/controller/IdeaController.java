package com.thanhpham.product_idea_validator.idea.controller;

import com.thanhpham.product_idea_validator.auth.service.CustomUserPrincipal;
import com.thanhpham.product_idea_validator.idea.DTO.request.CreateIdeaRequest;
import com.thanhpham.product_idea_validator.idea.DTO.request.UpdateIdeaRequest;
import com.thanhpham.product_idea_validator.idea.DTO.response.IdeaDetailResponse;
import com.thanhpham.product_idea_validator.idea.DTO.response.IdeaSummaryResponse;
import com.thanhpham.product_idea_validator.idea.service.IdeaService;
import com.thanhpham.product_idea_validator.model.Idea;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ideas")
@RequiredArgsConstructor
public class IdeaController {

    private final IdeaService ideaService;

    // POST /api/v1/ideas
    @PostMapping
    public ResponseEntity<IdeaDetailResponse> create(
            @Valid @RequestBody CreateIdeaRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {

        IdeaDetailResponse body = ideaService.create(req, extractUserId(userDetails));

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(body.id())
                .toUri();

        return ResponseEntity.created(location).body(body);
    }

    // GET /api/v1/ideas?status=DRAFT&page=0&size=20&sort=createdAt,desc
    @GetMapping
    public ResponseEntity<Page<IdeaSummaryResponse>> findAll(
            @RequestParam(required = false) Idea.Status status,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                ideaService.findAll(extractUserId(userDetails), status, pageable));
    }

    // GET /api/v1/ideas/{ideaId}
    @GetMapping("/{ideaId}")
    public ResponseEntity<IdeaDetailResponse> findById(
            @PathVariable UUID ideaId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                ideaService.findById(ideaId, extractUserId(userDetails)));
    }

    // PATCH /api/v1/ideas/{ideaId}
    @PatchMapping("/{ideaId}")
    public ResponseEntity<IdeaDetailResponse> update(
            @PathVariable UUID ideaId,
            @Valid @RequestBody UpdateIdeaRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                ideaService.update(ideaId, req, extractUserId(userDetails)));
    }

    // DELETE /api/v1/ideas/{ideaId}
    @DeleteMapping("/{ideaId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID ideaId,
            @AuthenticationPrincipal UserDetails userDetails) {

        ideaService.delete(ideaId, extractUserId(userDetails));
        return ResponseEntity.noContent().build();
    }

    // POST /api/v1/ideas/{ideaId}/share
    @PostMapping("/{ideaId}/share")
    public ResponseEntity<IdeaDetailResponse> enableShare(
            @PathVariable UUID ideaId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                ideaService.enableShare(ideaId, extractUserId(userDetails)));
    }

    // DELETE /api/v1/ideas/{ideaId}/share
    @DeleteMapping("/{ideaId}/share")
    public ResponseEntity<Void> disableShare(
            @PathVariable UUID ideaId,
            @AuthenticationPrincipal UserDetails userDetails) {

        ideaService.disableShare(ideaId, extractUserId(userDetails));
        return ResponseEntity.noContent().build();
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private UUID extractUserId(UserDetails userDetails) {
        return ((CustomUserPrincipal) userDetails).getUserId();
    }
}