package com.rookies5.intreview.dto.request;

import com.rookies5.intreview.domain.interview.InterviewQuestionSourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateInterviewQuestionRequest(
        @NotNull(message = "sourceType은 필수입니다.")
        InterviewQuestionSourceType sourceType,

        Long preparationQuestionId,

        Long questionBankQuestionId,

        @Size(max = 4000, message = "questionTextSnapshot은 4000자 이하여야 합니다.")
        String questionTextSnapshot,

        @NotNull(message = "sortOrder는 필수입니다.")
        @Min(value = 0, message = "sortOrder는 0 이상이어야 합니다.")
        Integer sortOrder
) {}
