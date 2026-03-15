package com.mzdx.zht;

import com.mzdx.zht.dto.EmailBindDTO;
import com.mzdx.zht.dto.EmailCodeDTO;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * 邮箱验证功能测试
 */
@SpringBootTest
public class EmailVerificationTest {
    
    @Test
    public void testEmailValidation() {
        // 测试邮箱格式验证
        String email = "test@example.com";
        System.out.println("Testing email: " + email);
        
        // 正则表达式验证邮箱格式
        String regex = "^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$";
        boolean isValid = email.matches(regex);
        System.out.println("Email is valid: " + isValid);
    }
    
    @Test
    public void testCodeGeneration() {
        // 测试验证码生成
        java.util.Random random = new java.util.Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            sb.append(random.nextInt(10));
        }
        String code = sb.toString();
        System.out.println("Generated code: " + code);
    }
}
