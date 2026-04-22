package com.thanhpham.product_idea_validator.idea.controller;

import com.thanhpham.product_idea_validator.auth.service.CustomUserPrincipal;
import com.thanhpham.product_idea_validator.idea.DTO.request.CreateVersionRequest;
import com.thanhpham.product_idea_validator.idea.DTO.response.EvaluationStatusResponse;
import com.thanhpham.product_idea_validator.idea.DTO.response.IdeaVersionResponse;
import com.thanhpham.product_idea_validator.idea.service.IdeaVersionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ideas/{ideaId}/versions")
@RequiredArgsConstructor
public class IdeaVersionController {

    private final IdeaVersionService versionService;

    // POST /api/v1/ideas/{ideaId}/versions
    @PostMapping
    public ResponseEntity<IdeaVersionResponse> create(
            @PathVariable UUID ideaId,
            @Valid @RequestBody CreateVersionRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {

        IdeaVersionResponse body = versionService.create(ideaId, req, extractUserId(userDetails));

        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(body.id())
                .toUri();

        return ResponseEntity.created(location).body(body);
    }

    // GET /api/v1/ideas/{ideaId}/versions
    @GetMapping
    public ResponseEntity<List<IdeaVersionResponse>> findAll(
            @PathVariable UUID ideaId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                versionService.findAll(ideaId, extractUserId(userDetails)));
    }

    // GET /api/v1/ideas/{ideaId}/versions/{versionId}
    @GetMapping("/{versionId}")
    public ResponseEntity<IdeaVersionResponse> findById(
            @PathVariable UUID ideaId,
            @PathVariable UUID versionId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                versionService.findById(ideaId, versionId, extractUserId(userDetails)));
    }

    // POST /api/v1/ideas/{ideaId}/versions/{versionId}/evaluate
    // Returns 202 Accepted — evaluation runs in background
    @PostMapping("/{versionId}/evaluate")
    public ResponseEntity<Void> triggerEvaluation(
            @PathVariable UUID ideaId,
            @PathVariable UUID versionId,
            @AuthenticationPrincipal UserDetails userDetails) {

        versionService.triggerEvaluation(ideaId, versionId, extractUserId(userDetails));
        return ResponseEntity.accepted().build();
    }

    // GET /api/v1/ideas/{ideaId}/versions/{versionId}/evaluate/status
    @GetMapping("/{versionId}/evaluate/status")
    public ResponseEntity<EvaluationStatusResponse> getEvaluationStatus(
            @PathVariable UUID ideaId,
            @PathVariable UUID versionId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                versionService.getEvaluationStatus(ideaId, versionId, extractUserId(userDetails)));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private UUID extractUserId(UserDetails userDetails) {
        return ((CustomUserPrincipal) userDetails).getUserId();
    }
}
