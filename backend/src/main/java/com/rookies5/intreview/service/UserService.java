package com.rookies5.intreview.service;

import com.rookies5.intreview.domain.user.User;
import com.rookies5.intreview.domain.user.UserStatus;
import com.rookies5.intreview.dto.request.LoginRequest;
import com.rookies5.intreview.dto.request.RegisterRequest;
import com.rookies5.intreview.dto.response.UserResponse;
import com.rookies5.intreview.exception.ApiException;
import com.rookies5.intreview.exception.ErrorCode;
import com.rookies5.intreview.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new ApiException(ErrorCode.DUPLICATE_USERNAME);
        }
        String hash = passwordEncoder.encode(request.password());
        User user = User.register(request.username(), hash);
        userRepository.save(user);
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new ApiException(ErrorCode.INVALID_CREDENTIALS));
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(ErrorCode.INVALID_CREDENTIALS);
        }
        if (!user.passwordMatches(passwordEncoder, request.password())) {
            throw new ApiException(ErrorCode.INVALID_CREDENTIALS);
        }
        return UserResponse.loginSummary(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        return UserResponse.from(user);
    }
}
