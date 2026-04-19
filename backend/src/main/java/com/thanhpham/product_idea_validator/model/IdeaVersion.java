package com.thanhpham.product_idea_validator.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "idea_versions")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdeaVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idea_id", nullable = false)
    private Idea idea;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "target_users", columnDefinition = "TEXT")
    private String targetUsers;

    @Column(columnDefinition = "TEXT")
    private String problem;

    @Column(columnDefinition = "TEXT")
    private String monetization;

    @Column(columnDefinition = "TEXT")
    private String risks;

    @Column(name = "clarity_score", precision = 4, scale = 2)
    private BigDecimal clarityScore;

    @Column(name = "market_score", precision = 4, scale = 2)
    private BigDecimal marketScore;

    @Column(name = "risk_score", precision = 4, scale = 2)
    private BigDecimal riskScore;

    @Column(name = "total_score", precision = 4, scale = 2)
    private BigDecimal totalScore;

    @Column(name = "ai_feedback", columnDefinition = "TEXT")
    private String aiFeedback;

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;
}