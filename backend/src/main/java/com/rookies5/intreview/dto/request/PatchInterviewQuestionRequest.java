package com.rookies5.intreview.dto.request;

import jakarta.validation.constraints.Size;

public record PatchInterviewQuestionRequest(
        @Size(max = 8000, message = "answerText는 8000자 이하여야 합니다.")
        String answerText,

        @Size(max = 8000, message = "reviewText는 8000자 이하여야 합니다.")
        String reviewText
) {}
