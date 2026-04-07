package com.rookies5.intreview;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvException;
import org.springframework.ai.autoconfigure.openai.OpenAiAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication(exclude = {OpenAiAutoConfiguration.class})
public class IntreviewApplication {

	public static void main(String[] args) {
		loadEnvFileIntoSystemProperties();
		SpringApplication.run(IntreviewApplication.class, args);
	}

	/**
	 * {@code .env}를 읽어 {@link System#setProperty}로 넣는다. Spring이
	 * {@code application.properties}의 {@code ${GROQ_API_KEY}} 를 풀 때 사용된다.
	 * <p>
	 * {@code Dotenv} 기본값은 <strong>현재 작업 디렉터리</strong>뿐이라, IDE가 루트에서 실행하면
	 * {@code backend/.env}를 못 찾는 경우가 많다. 그래서 후보 경로를 순서대로 시도한다.
	 * 이미 OS 환경 변수가 있으면 덮어쓰지 않는다.
	 */
	private static void loadEnvFileIntoSystemProperties() {
		String userDir = System.getProperty("user.dir", ".");
		Path[] candidates = new Path[] {
				Paths.get(userDir, ".env"),
				Paths.get(userDir, "backend", ".env.example"),
		};

		Dotenv dotenv = null;
		Path loadedFrom = null;
		for (Path envFile : candidates) {
			if (!Files.isRegularFile(envFile)) {
				continue;
			}
			try {
				dotenv = Dotenv.configure()
						.directory(envFile.getParent().toString())
						.filename(envFile.getFileName().toString())
						.load();
				loadedFrom = envFile;
				break;
			} catch (DotenvException e) {
				System.err.println("[intreview] .env 로드 실패: " + envFile.toAbsolutePath() + " — " + e.getMessage());
			}
		}

		if (dotenv == null) {
			System.err.println("[intreview] .env 없음 (시도한 경로: "
					+ Paths.get(userDir, ".env").toAbsolutePath() + ", "
					+ Paths.get(userDir, "backend", ".env").toAbsolutePath()
					+ "). Groq 키는 OS 환경 변수 GROQ_API_KEY 또는 위치에 맞는 .env 를 두세요.");
			return;
		}

		int applied = 0;
		for (var e : dotenv.entries()) {
			String key = e.getKey();
			if (System.getenv(key) != null) {
				continue;
			}
			if (System.getProperty(key) != null) {
				continue;
			}
			System.setProperty(key, e.getValue());
			applied++;
		}
		if (Boolean.getBoolean("intreview.debug.env")) {
			System.err.println("[intreview] .env 로드: " + loadedFrom.toAbsolutePath() + " (항목 " + applied + "개 적용)");
		}
	}

}
