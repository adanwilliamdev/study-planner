package com.studyplanner.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/** Relogio unico da aplicacao: "hoje" e os prazos nao dependem do fuso do servidor. */
@Configuration
public class RelogioConfig {

    @Bean
    public Clock clock(@Value("${app.timezone}") String zona) {
        return Clock.system(ZoneId.of(zona));
    }
}
