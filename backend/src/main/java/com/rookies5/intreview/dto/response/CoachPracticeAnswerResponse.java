package com.rookies5.intreview.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CoachPracticeAnswerResponse(
        String suggestedPracticeAnswer,
        String notes
) {
}
