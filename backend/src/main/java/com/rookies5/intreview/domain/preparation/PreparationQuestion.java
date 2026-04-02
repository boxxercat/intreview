package com.rookies5.intreview.domain.preparation;

import com.rookies5.intreview.domain.common.BaseEntity;
import com.rookies5.intreview.domain.questionbank.QuestionBankQuestion;
import com.rookies5.intreview.domain.user.User;
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
        name = "preparation_questions",
        indexes = @Index(name = "idx_prepq_owner_created", columnList = "owner_id, created_at")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PreparationQuestion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_bank_question_id")
    private QuestionBankQuestion questionBankQuestion;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 30)
    private PreparationQuestionSourceType sourceType;

    @Column(name = "question_text_snapshot", nullable = false, length = 4000)
    private String questionTextSnapshot;

    @Column(name = "practice_answer", length = 8000)
    private String practiceAnswer;

    private PreparationQuestion(
            User owner,
            QuestionBankQuestion questionBankQuestion,
            PreparationQuestionSourceType sourceType,
            String questionTextSnapshot,
            String practiceAnswer
    ) {
        this.owner = owner;
        this.questionBankQuestion = questionBankQuestion;
        this.sourceType = sourceType;
        this.questionTextSnapshot = questionTextSnapshot;
        this.practiceAnswer = practiceAnswer;
    }

    public static PreparationQuestion fromBank(User owner, QuestionBankQuestion asset, String practiceAnswer) {
        return new PreparationQuestion(
                owner,
                asset,
                PreparationQuestionSourceType.FROM_BANK,
                asset.getQuestionText(),
                practiceAnswer
        );
    }

    public static PreparationQuestion fromCustom(User owner, String customText, String practiceAnswer) {
        return new PreparationQuestion(
                owner,
                null,
                PreparationQuestionSourceType.CUSTOM,
                customText,
                practiceAnswer
        );
    }

    public void updateQuestionTextSnapshot(String newSnapshot) {
        if (newSnapshot == null || newSnapshot.isBlank()) {
            throw new IllegalArgumentException("questionTextSnapshot은 비어 있을 수 없습니다.");
        }
        this.questionTextSnapshot = newSnapshot;
    }

    public void updatePracticeAnswer(String newAnswer) {
        if (newAnswer == null || newAnswer.isBlank()) {
            throw new IllegalArgumentException("practiceAnswer는 비어 있을 수 없습니다.");
        }
        this.practiceAnswer = newAnswer;
    }

    public void clearPracticeAnswer() {
        this.practiceAnswer = null;
    }
}
