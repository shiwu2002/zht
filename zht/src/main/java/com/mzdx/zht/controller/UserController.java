package com.mzdx.zht.controller;

import com.mzdx.zht.common.Result;
import com.mzdx.zht.dto.LoginDTO;
import com.mzdx.zht.entity.User;
import com.mzdx.zht.service.UserService;
import com.mzdx.zht.vo.UserVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 用户控制器
 */
@Tag(name = "用户管理")
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @Operation(summary = "微信小程序登录")
    @PostMapping("/login")
    public Result<String> login(@RequestBody LoginDTO loginDTO) {
        String token = userService.login(loginDTO);
        return Result.success(token);
    }
    
    @Operation(summary = "获取用户信息")
    @GetMapping("/info")
    public Result<UserVO> getUserInfo(@RequestAttribute("userId") Long userId) {
        UserVO userVO = userService.getUserInfo(userId);
        return Result.success(userVO);
    }
    
    @Operation(summary = "更新用户信息")
    @PutMapping("/update")
    public Result<Boolean> updateUserInfo(@RequestAttribute("userId") Long userId,
                                          @RequestBody User user) {
        user.setId(userId);
        boolean result = userService.updateUserInfo(user);
        return Result.success(result);
    }
    
    @Operation(summary = "绑定手机号")
    @PostMapping("/bind-phone")
    public Result<Boolean> bindPhone(@RequestAttribute("userId") Long userId,
                                     @RequestParam String phone) {
        boolean result = userService.bindPhone(userId, phone);
        return Result.success(result);
    }
    
    @Operation(summary = "获取用户信用分")
    @GetMapping("/credit-score")
    public Result<Integer> getCreditScore(@RequestAttribute("userId") Long userId) {
        Integer score = userService.getCreditScore(userId);
        return Result.success(score);
    }

    @Operation(summary = "获取其他用户信息")
    @GetMapping("/info/{userId}")
    public Result<UserVO> getUserInfoById(@PathVariable("userId") Long userId) {
        UserVO userVO = userService.getUserInfo(userId);
    return Result.success(userVO);
}
}
