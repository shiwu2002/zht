package com.mzdx.zht.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mzdx.zht.common.Result;
import com.mzdx.zht.dto.ItemDTO;
import com.mzdx.zht.service.ItemService;
import com.mzdx.zht.vo.ItemVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 物品控制器
 */
@Tag(name = "物品管理")
@RestController
@RequestMapping("/api/item")
@RequiredArgsConstructor
public class ItemController {
    
    private final ItemService itemService;
    
    @Operation(summary = "发布物品")
    @PostMapping("/publish")
    public Result<Boolean> publishItem(@RequestAttribute("userId") Long userId,
                                       @RequestBody ItemDTO itemDTO) {
        boolean result = itemService.publishItem(itemDTO, userId);
        return Result.success(result);
    }
    
    @Operation(summary = "更新物品")
    @PutMapping("/update")
    public Result<Boolean> updateItem(@RequestAttribute("userId") Long userId,
                                      @RequestBody ItemDTO itemDTO) {
        boolean result = itemService.updateItem(itemDTO, userId);
        return Result.success(result);
    }
    
    @Operation(summary = "删除物品")
    @DeleteMapping("/{itemId}")
    public Result<Boolean> deleteItem(@RequestAttribute("userId") Long userId,
                                      @PathVariable Long itemId) {
        boolean result = itemService.deleteItem(itemId, userId);
        return Result.success(result);
    }
    
    @Operation(summary = "获取物品详情")
    @GetMapping("/{itemId}")
    public Result<ItemVO> getItemDetail(@PathVariable Long itemId) {
        ItemVO itemVO = itemService.getItemDetail(itemId);
        return Result.success(itemVO);
    }
    
    @Operation(summary = "分页查询物品列表")
    @GetMapping("/list")
    public Result<Page<ItemVO>> getItemList(
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer type,
            @RequestParam(defaultValue = "time") String sortBy) {
        Page<ItemVO> page = itemService.getItemList(current, size, categoryId, keyword, type, sortBy);
        return Result.success(page);
    }
    
    @Operation(summary = "获取我的发布")
    @GetMapping("/my")
    public Result<Page<ItemVO>> getMyItems(@RequestAttribute("userId") Long userId,
                                           @RequestParam(defaultValue = "1") Integer current,
                                           @RequestParam(defaultValue = "10") Integer size) {
        Page<ItemVO> page = itemService.getMyItems(userId, current, size);
        return Result.success(page);
    }
    
    @Operation(summary = "获取附近的物品")
    @GetMapping("/nearby")
    public Result<List<ItemVO>> getNearbyItems(
            @RequestParam Double longitude,
            @RequestParam Double latitude,
            @RequestParam(defaultValue = "5000") Integer distance) {
        List<ItemVO> items = itemService.getNearbyItems(longitude, latitude, distance);
        return Result.success(items);
    }
}
