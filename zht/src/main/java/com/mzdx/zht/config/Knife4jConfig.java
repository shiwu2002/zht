package com.mzdx.zht.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Knife4jConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("闲置物品交换平台API文档")
                        .version("1.0.0")
                        .description("基于微信小程序的闲置物品交换平台后端接口文档")
                        .contact(new Contact().name("开发团队").email("dev@example.com"))
                        .license(new License().name("Apache 2.0")
                                .url("http://www.apache.org/licenses/LICENSE-2.0.html")));
    }
}
