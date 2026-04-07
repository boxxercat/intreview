package com.rookies5.intreview.config;

import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

/**
 * {@code spring.ai.openai.api-key}가 비어 있지 않을 때만 매칭합니다.
 * 키 없이도 애플리케이션이 기동되도록 OpenAI 자동 설정 대신 사용합니다.
 */
public class GroqApiKeyPresentCondition implements Condition {

    @Override
    public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
        String key = context.getEnvironment().getProperty("spring.ai.openai.api-key");
        return key != null && !key.isBlank();
    }
}
