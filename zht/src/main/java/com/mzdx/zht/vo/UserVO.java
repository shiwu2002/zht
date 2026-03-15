package com.mzdx.zht.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserVO {
    private Long id;
    private String nickname;
    private String avatar;
    private String phone;
    private String email;
    private Integer emailVerified;
    private Integer gender;
    private String address;
    private Integer creditScore;
    private LocalDateTime createTime;
}
