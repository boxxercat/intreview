package com.rookies5.intreview.domain.interview;

import com.rookies5.intreview.domain.common.BaseEntity;
import com.rookies5.intreview.domain.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Entity
@Table(
        name = "interviews",
        indexes = @Index(name = "idx_interviews_owner_date", columnList = "user_id, interview_date")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Interview extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "company_name", nullable = false, length = 120)
    private String companyName;

    @Column(name = "position_title", nullable = false, length = 120)
    private String positionTitle;

    @Column(name = "interview_date", nullable = false)
    private LocalDate interviewDate;

    /** DB NOT NULL 제약 호환. API 미노출. */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private InterviewStatus status;

    /**
     * 1차 면접, 직무 면접 등 구분. DB 컬럼명은 기존 {@code memo} 유지.
     */
    @Column(name = "memo", nullable = false, length = 2000)
    private String interviewRound;

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true)
    private final List<InterviewQuestion> interviewQuestions = new ArrayList<>();

    private Interview(
            User user,
            String companyName,
            String positionTitle,
            LocalDate interviewDate,
            String interviewRound
    ) {
        this.user = user;
        this.companyName = companyName;
        this.positionTitle = positionTitle;
        this.interviewDate = interviewDate;
        this.interviewRound = interviewRound == null ? "" : interviewRound;
        this.status = InterviewStatus.DRAFT;
    }

    public static Interview create(
            User user,
            String companyName,
            String positionTitle,
            LocalDate interviewDate,
            String interviewRound
    ) {
        return new Interview(user, companyName, positionTitle, interviewDate, interviewRound);
    }

    public void update(
            String companyName,
            String positionTitle,
            LocalDate interviewDate,
            String interviewRound
    ) {
        this.companyName = companyName;
        this.positionTitle = positionTitle;
        this.interviewDate = interviewDate;
        this.interviewRound = interviewRound == null ? "" : interviewRound;
    }

    public void addInterviewQuestion(InterviewQuestion question) {
        this.interviewQuestions.add(question);
        question.setInterview(this);
        this.interviewQuestions.sort(Comparator.comparingInt(InterviewQuestion::getSortOrder));
    }
}
