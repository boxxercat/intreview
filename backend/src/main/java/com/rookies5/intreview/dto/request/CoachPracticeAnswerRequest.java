package com.rookies5.intreview.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CoachPracticeAnswerRequest(
        @NotBlank(message = "연습 답변 초안이 필요합니다.")
        @Size(max = 8000, message = "연습 답변은 8000자 이하여야 합니다.")
        String practiceAnswerDraft
) {
}
