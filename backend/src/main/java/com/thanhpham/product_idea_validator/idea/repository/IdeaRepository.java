package com.thanhpham.product_idea_validator.idea.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.thanhpham.product_idea_validator.model.Idea;

import jakarta.persistence.LockModeType;

public interface IdeaRepository extends JpaRepository<Idea, UUID> {

    @Query("SELECT i FROM Idea i WHERE i.user.id = :userId")
    Page<Idea> findAllByUserId(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT i FROM Idea i WHERE i.user.id = :userId AND i.status = :status")
    Page<Idea> findAllByUserIdAndStatus(
            @Param("userId") UUID userId,
            @Param("status") Idea.Status status,
            Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Idea i WHERE i.id = :id")
    Optional<Idea> findByIdForUpdate(@Param("id") UUID id);

    Optional<Idea> findByShareToken(String shareToken);

    boolean existsByShareToken(String shareToken);

    @Query("""
                SELECT COUNT(i)
                FROM Idea i
                WHERE i.user.id = :userId
            """)
    long countByUserId(@Param("userId") UUID userId);
}