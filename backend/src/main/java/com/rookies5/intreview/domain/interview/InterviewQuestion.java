package com.rookies5.intreview.domain.interview;

import com.rookies5.intreview.domain.common.BaseEntity;
import com.rookies5.intreview.domain.preparation.PreparationQuestion;
import com.rookies5.intreview.domain.questionbank.QuestionBankQuestion;
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
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "interview_questions",
        indexes = @Index(name = "idx_interview_questions_interview_sort", columnList = "interview_id, sort_order")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InterviewQuestion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preparation_question_id")
    private PreparationQuestion preparationQuestion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_bank_question_id")
    private QuestionBankQuestion questionBankQuestion;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 30)
    private InterviewQuestionSourceType sourceType;

    @Column(name = "question_text_snapshot", nullable = false, length = 4000)
    private String questionTextSnapshot;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "answer_text", length = 8000)
    private String answerText;

    @Column(name = "review_text", length = 8000)
    private String reviewText;

    private InterviewQuestion(
            Interview interview,
            PreparationQuestion preparationQuestion,
            QuestionBankQuestion questionBankQuestion,
            InterviewQuestionSourceType sourceType,
            String questionTextSnapshot,
            int sortOrder
    ) {
        this.interview = interview;
        this.preparationQuestion = preparationQuestion;
        this.questionBankQuestion = questionBankQuestion;
        this.sourceType = sourceType;
        this.questionTextSnapshot = questionTextSnapshot;
        this.sortOrder = sortOrder;
    }

    public static InterviewQuestion fromPreparation(Interview interview, PreparationQuestion preparationQuestion, int sortOrder) {
        return new InterviewQuestion(
                interview,
                preparationQuestion,
                null,
                InterviewQuestionSourceType.FROM_PREPARATION,
                preparationQuestion.getQuestionTextSnapshot(),
                sortOrder
        );
    }

    public static InterviewQuestion fromBank(Interview interview, QuestionBankQuestion asset, int sortOrder) {
        return new InterviewQuestion(
                interview,
                null,
                asset,
                InterviewQuestionSourceType.FROM_BANK,
                asset.getQuestionText(),
                sortOrder
        );
    }

    public static InterviewQuestion fromCustom(Interview interview, String customText, int sortOrder) {
        return new InterviewQuestion(
                interview,
                null,
                null,
                InterviewQuestionSourceType.CUSTOM,
                customText,
                sortOrder
        );
    }

    void setInterview(Interview interview) {
        this.interview = interview;
    }

    public void updateAnswerText(String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("answerText는 비어 있을 수 없습니다.");
        }
        this.answerText = content;
    }

    public void clearAnswerText() {
        this.answerText = null;
    }

    public void updateReviewText(String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("reviewText는 비어 있을 수 없습니다.");
        }
        this.reviewText = content;
    }

    public void clearReviewText() {
        this.reviewText = null;
    }

    public void updateSortOrder(int sortOrder) {
        if (sortOrder < 0) {
            throw new IllegalArgumentException("sortOrder는 0 이상이어야 합니다.");
        }
        this.sortOrder = sortOrder;
    }

    /**
     * 준비 질문 엔티티 삭제 전 FK 제약을 피하기 위해 호출한다.
     * 질문 스냅샷은 유지하고 출처만 {@link InterviewQuestionSourceType#CUSTOM}으로 바꾼다.
     */
    public void unlinkPreparationForDeletion() {
        if (this.sourceType != InterviewQuestionSourceType.FROM_PREPARATION) {
            return;
        }
        this.preparationQuestion = null;
        this.sourceType = InterviewQuestionSourceType.CUSTOM;
    }
}
