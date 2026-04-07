package com.rookies5.intreview.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    DUPLICATE_USERNAME("DUPLICATE_USERNAME", HttpStatus.CONFLICT, "이미 사용 중인 username입니다."),
    INVALID_CREDENTIALS("INVALID_CREDENTIALS", HttpStatus.UNAUTHORIZED, "username 또는 password가 올바르지 않습니다."),
    USER_NOT_FOUND("USER_NOT_FOUND", HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),

    USER_ID_REQUIRED("USER_ID_REQUIRED", HttpStatus.BAD_REQUEST, "X-User-Id 헤더가 필요합니다."),
    INVALID_USER_ID_HEADER("INVALID_USER_ID_HEADER", HttpStatus.BAD_REQUEST, "X-User-Id는 유효한 숫자여야 합니다."),

    QUESTION_BANK_NOT_FOUND("QUESTION_BANK_NOT_FOUND", HttpStatus.NOT_FOUND, "질문 자산을 찾을 수 없습니다."),
    PREPARATION_QUESTION_NOT_FOUND("PREPARATION_QUESTION_NOT_FOUND", HttpStatus.NOT_FOUND, "준비 질문을 찾을 수 없습니다."),
    INTERVIEW_NOT_FOUND("INTERVIEW_NOT_FOUND", HttpStatus.NOT_FOUND, "면접 정보를 찾을 수 없습니다."),
    INTERVIEW_QUESTION_NOT_FOUND("INTERVIEW_QUESTION_NOT_FOUND", HttpStatus.NOT_FOUND, "면접 질문을 찾을 수 없습니다."),

    INVALID_SOURCE_COMBINATION("INVALID_SOURCE_COMBINATION", HttpStatus.UNPROCESSABLE_ENTITY, "sourceType과 참조 필드 조합이 올바르지 않습니다."),
    ACCESS_DENIED("ACCESS_DENIED", HttpStatus.FORBIDDEN, "해당 리소스에 접근할 권한이 없습니다."),
    ARCHIVED_QUESTION_NOT_EDITABLE(
            "ARCHIVED_QUESTION_NOT_EDITABLE",
            HttpStatus.UNPROCESSABLE_ENTITY,
            "보관된 질문 자산은 수정할 수 없습니다. archived를 해제하거나 새 자산을 등록하세요."
    ),

    VALIDATION_ERROR("VALIDATION_ERROR", HttpStatus.BAD_REQUEST, "요청 값이 올바르지 않습니다."),
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),

    AI_NOT_CONFIGURED(
            "AI_NOT_CONFIGURED",
            HttpStatus.SERVICE_UNAVAILABLE,
            "AI 코칭이 설정되지 않았습니다. GROQ_API_KEY 등 환경 변수를 확인하세요."
    ),
    AI_COACHING_FAILED(
            "AI_COACHING_FAILED",
            HttpStatus.BAD_GATEWAY,
            "AI 첨삭 요청에 실패했습니다."
    );

    private final String code;
    private final HttpStatus httpStatus;
    private final String defaultMessage;

    ErrorCode(String code, HttpStatus httpStatus, String defaultMessage) {
        this.code = code;
        this.httpStatus = httpStatus;
        this.defaultMessage = defaultMessage;
    }

    public String getCode() {
        return code;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}

