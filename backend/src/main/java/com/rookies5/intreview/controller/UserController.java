package com.rookies5.intreview.controller;

import com.rookies5.intreview.dto.response.ApiResponse;
import com.rookies5.intreview.dto.response.UserResponse;
import com.rookies5.intreview.service.UserService;
import com.rookies5.intreview.web.UserIdHeader;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        long userId = UserIdHeader.parseRequired(userIdHeader);
        UserResponse data = userService.getMe(userId);
        return ResponseEntity.ok(ApiResponse.ok(data, "내 정보 조회에 성공했습니다."));
    }
}
