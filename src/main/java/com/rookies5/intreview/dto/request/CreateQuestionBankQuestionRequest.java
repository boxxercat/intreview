package com.rookies5.intreview.dto.request;

import com.rookies5.intreview.domain.questionbank.QuestionAssetSourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateQuestionBankQuestionRequest(
        @NotBlank(message = "questionText는 필수입니다.")
        @Size(max = 4000, message = "questionText는 4000자 이하여야 합니다.")
        String questionText,

        @NotNull(message = "sourceType은 필수입니다.")
        QuestionAssetSourceType sourceType
) {}
