package com.mzdx.zht.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ItemVO {
    private Long id;
    private Long userId;
    private String userNickname;
    private String userAvatar;
    private String title;
    private String description;
    private List<String> images;
    private Long categoryId;
    private String categoryName;
    private List<String> tags;
    private Integer exchangeType;
    private BigDecimal price;
    private String exchangeCondition;
    private String location;
    private Double longitude;
    private Double latitude;
    private Integer status;
    private Integer viewCount;
    private Integer favoriteCount;
    private Boolean isFavorite;
    private LocalDateTime createTime;
}
