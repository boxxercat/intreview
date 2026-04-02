package com.rookies5.intreview.dto.request;

import com.rookies5.intreview.domain.preparation.PreparationQuestionSourceType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreatePreparationQuestionRequest(
        @NotNull(message = "sourceType은 필수입니다.")
        PreparationQuestionSourceType sourceType,

        Long questionBankQuestionId,

        @Size(max = 4000, message = "questionTextSnapshot은 4000자 이하여야 합니다.")
        String questionTextSnapshot,

        @Size(max = 8000, message = "practiceAnswer는 8000자 이하여야 합니다.")
        String practiceAnswer
) {}
