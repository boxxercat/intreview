package com.rookies5.intreview.domain.questionbank;

import com.rookies5.intreview.domain.common.BaseEntity;
import com.rookies5.intreview.domain.user.User;
import com.rookies5.intreview.exception.ArchivedQuestionNotEditableException;
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
        name = "question_bank_questions",
        indexes = @Index(name = "idx_qbq_owner_date", columnList = "owner_id, created_at")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuestionBankQuestion extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "question_text", nullable = false, length = 4000)
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 30)
    private QuestionAssetSourceType sourceType;

    @Column(name = "archived", nullable = false)
    private boolean archived;

    private QuestionBankQuestion(User owner, String questionText, QuestionAssetSourceType sourceType) {
        this.owner = owner;
        this.questionText = questionText;
        this.sourceType = sourceType;
        this.archived = false;
    }

    public static QuestionBankQuestion create(User owner, String questionText, QuestionAssetSourceType sourceType) {
        return new QuestionBankQuestion(owner, questionText, sourceType);
    }

    public void archive() {
        this.archived = true;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

    public void updateQuestionText(String newText) {
        if (this.archived) {
            throw new ArchivedQuestionNotEditableException();
        }
        this.questionText = newText;
    }
}
