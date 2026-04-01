package com.rookies5.intreview.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.rookies5.intreview.domain.user.User;

import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UserResponse(
        Long id,
        String username,
        Instant createdAt,
        Instant updatedAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    /** 로그인 응답: REST 설계서상 id, username 중심 */
    public static UserResponse loginSummary(User user) {
        return new UserResponse(user.getId(), user.getUsername(), null, null);
    }
}
