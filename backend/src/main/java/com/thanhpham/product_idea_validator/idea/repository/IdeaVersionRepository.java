package com.thanhpham.product_idea_validator.idea.repository;

import com.thanhpham.product_idea_validator.idea.DTO.response.IdeaVersionResponse;
import com.thanhpham.product_idea_validator.model.IdeaVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IdeaVersionRepository extends JpaRepository<IdeaVersion, UUID> {

    @Query("""
                SELECT v FROM IdeaVersion v
                WHERE v.idea.id = :ideaId
                ORDER BY v.versionNumber DESC
            """)
    List<IdeaVersion> findTopByIdeaIdOrderByVersionNumberDesc(@Param("ideaId") UUID ideaId);

    @Query("SELECT COALESCE(MAX(v.versionNumber), 0) FROM IdeaVersion v WHERE v.idea.id = :ideaId")
    int findMaxVersionNumber(@Param("ideaId") UUID ideaId);

    @Query("SELECT v FROM IdeaVersion v WHERE v.idea.id = :ideaId ORDER BY v.versionNumber DESC LIMIT 1")
    Optional<IdeaVersion> findLatestByIdeaId(@Param("ideaId") UUID ideaId);

    @Query("SELECT v FROM IdeaVersion v WHERE v.idea.id = :ideaId AND v.id = :versionId")
    Optional<IdeaVersion> findByIdeaIdAndVersionId(
            @Param("ideaId") UUID ideaId,
            @Param("versionId") UUID versionId);

    // Conditional write — only updates when totalScore IS NULL (idempotent guard)
    @Modifying
    @Query("""
            UPDATE IdeaVersion v SET
                v.clarityScore = :clarity,
                v.marketScore  = :market,
                v.riskScore    = :risk,
                v.totalScore   = :total,
                v.aiFeedback   = :feedback
            WHERE v.id = :id AND v.totalScore IS NULL
            """)
    int updateScoresIfNotEvaluated(
            @Param("id") UUID id,
            @Param("clarity") BigDecimal clarity,
            @Param("market") BigDecimal market,
            @Param("risk") BigDecimal risk,
            @Param("total") BigDecimal total,
            @Param("feedback") String feedback);

    Collection<IdeaVersionResponse> findAllByIdeaIdOrderByVersionNumberAsc(UUID ideaId);

    @Modifying
    @Query("""
                UPDATE IdeaVersion v
                SET v.aiFeedback = '__FAILED__'
                WHERE v.id = :id AND v.totalScore IS NULL
            """)
    int markFailedIfNotEvaluated(@Param("id") UUID id);

    boolean existsByIdeaIdAndAiFeedbackStartingWith(UUID ideaId, String prefix);
}