package com.mzdx.zht.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mzdx.zht.common.Result;
import com.mzdx.zht.dto.ExchangeDTO;
import com.mzdx.zht.service.ExchangeService;
import com.mzdx.zht.vo.ExchangeVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 交换控制器
 */
@Tag(name = "交换管理")
@RestController
@RequestMapping("/exchange")
@RequiredArgsConstructor
public class ExchangeController {
    
    private final ExchangeService exchangeService;
    
    @Operation(summary = "发起交换申请")
    @PostMapping("/create")
    public Result<Boolean> createExchange(@RequestAttribute("userId") Long userId,
                                          @RequestBody ExchangeDTO exchangeDTO) {
        boolean result = exchangeService.createExchange(exchangeDTO, userId);
        return Result.success(result);
    }
    
    @Operation(summary = "确认交换")
    @PostMapping("/confirm/{exchangeId}")
    public Result<Boolean> confirmExchange(@RequestAttribute("userId") Long userId,
                                           @PathVariable Long exchangeId) {
        boolean result = exchangeService.confirmExchange(exchangeId, userId);
        return Result.success(result);
    }
    
    @Operation(summary = "拒绝交换")
    @PostMapping("/reject/{exchangeId}")
    public Result<Boolean> rejectExchange(@RequestAttribute("userId") Long userId,
                                          @PathVariable Long exchangeId,
                                          @RequestParam String reason) {
        boolean result = exchangeService.rejectExchange(exchangeId, userId, reason);
        return Result.success(result);
    }
    
    @Operation(summary = "取消交换")
    @PostMapping("/cancel/{exchangeId}")
    public Result<Boolean> cancelExchange(@RequestAttribute("userId") Long userId,
                                          @PathVariable Long exchangeId) {
        boolean result = exchangeService.cancelExchange(exchangeId, userId);
        return Result.success(result);
    }
    
    @Operation(summary = "完成交换")
    @PostMapping("/complete/{exchangeId}")
    public Result<Boolean> completeExchange(@RequestAttribute("userId") Long userId,
                                            @PathVariable Long exchangeId) {
        boolean result = exchangeService.completeExchange(exchangeId, userId);
        return Result.success(result);
    }
    
    @Operation(summary = "获取交换详情")
    @GetMapping("/{exchangeId}")
    public Result<ExchangeVO> getExchangeDetail(@PathVariable Long exchangeId) {
        ExchangeVO exchangeVO = exchangeService.getExchangeDetail(exchangeId);
        return Result.success(exchangeVO);
    }
    
    @Operation(summary = "获取我的交换记录")
    @GetMapping("/my")
    public Result<Page<ExchangeVO>> getMyExchanges(
            @RequestAttribute("userId") Long userId,
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer type) {
        Page<ExchangeVO> page = exchangeService.getMyExchanges(userId, current, size, type);
        return Result.success(page);
    }
}
