package com.rookies5.intreview.exception;

public class DuplicateUsernameException extends RuntimeException {

    public DuplicateUsernameException() {
        super("이미 사용 중인 username입니다.");
    }
}
