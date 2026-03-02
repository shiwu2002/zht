package com.mzdx.zht.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mzdx.zht.common.Result;
import com.mzdx.zht.service.FavoriteService;
import com.mzdx.zht.vo.ItemVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 收藏控制器
 */
@Tag(name = "收藏管理")
@RestController
@RequestMapping("/api/favorite")
@RequiredArgsConstructor
public class FavoriteController {
    
    private final FavoriteService favoriteService;
    
    @Operation(summary = "添加收藏")
    @PostMapping("/add/{itemId}")
    public Result<Boolean> addFavorite(@RequestAttribute("userId") Long userId,
                                       @PathVariable Long itemId) {
        boolean result = favoriteService.addFavorite(itemId, userId);
        return Result.success(result);
    }
    
    @Operation(summary = "取消收藏")
    @DeleteMapping("/remove/{itemId}")
    public Result<Boolean> removeFavorite(@RequestAttribute("userId") Long userId,
                                          @PathVariable Long itemId) {
        boolean result = favoriteService.removeFavorite(itemId, userId);
        return Result.success(result);
    }
    
    @Operation(summary = "检查是否已收藏")
    @GetMapping("/check/{itemId}")
    public Result<Boolean> isFavorite(@RequestAttribute("userId") Long userId,
                                      @PathVariable Long itemId) {
        boolean result = favoriteService.isFavorite(itemId, userId);
        return Result.success(result);
    }
    
    @Operation(summary = "获取我的收藏")
    @GetMapping("/my")
    public Result<Page<ItemVO>> getMyFavorites(
            @RequestAttribute("userId") Long userId,
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size) {
        Page<ItemVO> page = favoriteService.getMyFavorites(userId, current, size);
        return Result.success(page);
    }
}
