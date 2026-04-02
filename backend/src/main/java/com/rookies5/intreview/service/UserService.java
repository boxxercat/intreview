package com.rookies5.intreview.service;

import com.rookies5.intreview.domain.user.User;
import com.rookies5.intreview.domain.user.UserStatus;
import com.rookies5.intreview.dto.request.LoginRequest;
import com.rookies5.intreview.dto.request.RegisterRequest;
import com.rookies5.intreview.dto.response.UserResponse;
import com.rookies5.intreview.exception.DuplicateUsernameException;
import com.rookies5.intreview.exception.InvalidCredentialsException;
import com.rookies5.intreview.exception.UserNotFoundException;
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
            throw new DuplicateUsernameException();
        }
        String hash = passwordEncoder.encode(request.password());
        User user = User.register(request.username(), hash);
        userRepository.save(user);
        return UserResponse.from(user);
    }

    @Transactional(readOnly = true)
    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(InvalidCredentialsException::new);
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new InvalidCredentialsException();
        }
        if (!user.passwordMatches(passwordEncoder, request.password())) {
            throw new InvalidCredentialsException();
        }
        return UserResponse.loginSummary(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(UserNotFoundException::new);
        return UserResponse.from(user);
    }
}
