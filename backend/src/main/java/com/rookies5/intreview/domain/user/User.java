package com.rookies5.intreview.domain.user;

import com.rookies5.intreview.domain.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "users",
        uniqueConstraints = @UniqueConstraint(name = "uk_users_username", columnNames = "username")
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "username", nullable = false, length = 30)
    private String username;

    @Column(name = "password_hash", nullable = false, length = 200)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private UserStatus status;

    private User(String username, String passwordHash) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = UserRole.USER;
        this.status = UserStatus.ACTIVE;
    }

    public static User register(String username, String passwordHash) {
        return new User(username, passwordHash);
    }

    public boolean passwordMatches(org.springframework.security.crypto.password.PasswordEncoder encoder, String rawPassword) {
        return encoder.matches(rawPassword, this.passwordHash);
    }

    public void deactivate() {
        if (this.status == UserStatus.INACTIVE) {
            return;
        }
        this.status = UserStatus.INACTIVE;
    }
}
