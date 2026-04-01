package com.rookies5.intreview.exception;

public class QuestionBankNotFoundException extends RuntimeException {

    public QuestionBankNotFoundException() {
        super("질문 자산을 찾을 수 없습니다.");
    }
}
