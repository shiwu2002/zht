package com.mzdx.zht.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mzdx.zht.entity.Item;
import com.mzdx.zht.dto.ItemDTO;
import com.mzdx.zht.vo.ItemVO;

import java.util.List;

/**
 * 物品服务接口
 */
public interface ItemService extends IService<Item> {
    
    /**
     * 发布物品
     */
    boolean publishItem(ItemDTO itemDTO, Long userId);
    
    /**
     * 更新物品
     */
    boolean updateItem(ItemDTO itemDTO, Long userId);
    
    /**
     * 删除物品
     */
    boolean deleteItem(Long itemId, Long userId);
    
    /**
     * 获取物品详情
     */
    ItemVO getItemDetail(Long itemId);
    
    /**
     * 分页查询物品列表
     */
    Page<ItemVO> getItemList(Integer current, Integer size, Long categoryId, 
                             String keyword, Integer type, String sortBy);
    
    /**
     * 获取我的发布
     */
    Page<ItemVO> getMyItems(Long userId, Integer current, Integer size);
    
    /**
     * 获取附近的物品
     */
    List<ItemVO> getNearbyItems(Double longitude, Double latitude, Integer distance);
    
    /**
     * 更新物品状态
     */
    boolean updateItemStatus(Long itemId, Integer status);
}
