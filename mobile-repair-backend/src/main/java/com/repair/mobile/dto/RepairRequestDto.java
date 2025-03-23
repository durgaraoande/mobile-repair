package com.repair.mobile.dto;

import com.repair.mobile.enums.ProblemCategory;
import lombok.Data;

@Data
public class RepairRequestDto {
    private String deviceBrand;
    private String deviceModel;
    private String imeiNumber;
    private ProblemCategory problemCategory;
    private String problemDescription;
}
