package com.thanhpham.product_idea_validator.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ideas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Idea extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.DRAFT;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private Boolean isPublic = false;

    @Column(name = "share_token", unique = true)
    private String shareToken;

    @OneToMany(mappedBy = "idea", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("versionNumber ASC")
    @Builder.Default
    private List<IdeaVersion> versions = new ArrayList<>();

    @OneToMany(mappedBy = "idea", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<IdeaTag> ideaTags = new ArrayList<>();

    public void generateShareToken() {
        this.shareToken = UUID.randomUUID().toString().replace("-", "");
    }

    public enum Status {
        DRAFT, ACTIVE, ARCHIVED
    }
}