package com.rookies5.intreview.controller;

import com.rookies5.intreview.dto.request.LoginRequest;
import com.rookies5.intreview.dto.request.RegisterRequest;
import com.rookies5.intreview.dto.response.ApiResponse;
import com.rookies5.intreview.dto.response.UserResponse;
import com.rookies5.intreview.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse data = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(data, "회원가입이 완료되었습니다."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(@Valid @RequestBody LoginRequest request) {
        UserResponse data = userService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(data, "로그인에 성공했습니다."));
    }
}
