package com.rookies5.intreview.config;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;

/**
 * Groq(OpenAI 호환)용 {@link ChatModel}. {@code spring.ai.openai.api-key}가 있을 때만 등록합니다.
 */
@Configuration
@Conditional(GroqApiKeyPresentCondition.class)
public class GroqChatModelConfiguration {

    @Bean
    public ChatModel groqChatModel(
            @Value("${spring.ai.openai.base-url:https://api.groq.com/openai}") String baseUrl,
            @Value("${spring.ai.openai.api-key}") String apiKey,
            @Value("${spring.ai.openai.chat.options.model:llama-3.3-70b-versatile}") String model,
            @Value("${spring.ai.openai.chat.options.temperature:0.4}") double temperature
    ) {
        OpenAiApi api = new OpenAiApi(baseUrl, apiKey);
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .model(model)
                .temperature(temperature)
                .build();
        return new OpenAiChatModel(api, options);
    }
}
