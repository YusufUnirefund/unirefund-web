import {
  $Volo_Abp_Identity_IdentityRoleDto,
  $Volo_Abp_Identity_IdentityRoleCreateDto,
  $Volo_Abp_Identity_IdentityRoleUpdateDto,
  $Volo_Abp_Identity_IdentityUserUpdateDto,
  $Volo_Abp_Identity_CreateClaimTypeDto,
  $Volo_Abp_Identity_ClaimTypeDto,
  $Volo_Abp_Identity_UpdateClaimTypeDto,
  $Volo_Abp_OpenIddict_Applications_Dtos_CreateApplicationInput,
  $Volo_Abp_OpenIddict_Applications_Dtos_UpdateApplicationInput,
  $Volo_Abp_OpenIddict_Applications_Dtos_ApplicationDto,
  $Volo_Abp_OpenIddict_Scopes_Dtos_CreateScopeInput,
  $Volo_Abp_OpenIddict_Scopes_Dtos_ScopeDto,
  $Volo_Abp_OpenIddict_Scopes_Dtos_UpdateScopeInput,
} from "@ayasofyazilim/saas/IdentityService";
import { $Volo_Abp_Identity_IdentityUserCreateDto } from "@ayasofyazilim/saas/IdentityService";
import { useEffect, useState } from "react";
import { createZodObject, getBaseLink } from "src/utils";
import {
  tableAction,
  columnsType,
} from "@repo/ayasofyazilim-ui/molecules/tables";
import { toast } from "@/components/ui/sonner";
import {
  $Volo_Saas_Host_Dtos_EditionCreateDto,
  $Volo_Saas_Host_Dtos_EditionDto,
  $Volo_Saas_Host_Dtos_EditionUpdateDto,
  $Volo_Saas_Host_Dtos_SaasTenantUpdateDto,
} from "@ayasofyazilim/saas/SaasService";
import {
  $Volo_Saas_Host_Dtos_SaasTenantCreateDto,
  $Volo_Saas_Host_Dtos_SaasTenantDto,
} from "@ayasofyazilim/saas/SaasService";
import { z } from "zod";
import { $Volo_Abp_Identity_IdentityUserDto } from "@ayasofyazilim/saas/AccountService";
import { DependencyType } from "node_modules/@repo/ayasofyazilim-ui/src/organisms/auto-form/types";
import {
  $Volo_Abp_LanguageManagement_Dto_CreateLanguageDto,
  $Volo_Abp_LanguageManagement_Dto_LanguageDto,
  $Volo_Abp_LanguageManagement_Dto_UpdateLanguageDto,
} from "@ayasofyazilim/saas/AdministrationService";

export type formModifier = {
  formPositions?: string[];
  excludeList?: string[];
  schema: any;
  convertors?: Record<string, any>;
  dependencies?: Array<{
    sourceField: string;
    type: DependencyType;
    targetField: string;
    when: (value: any) => boolean;
  }>;
};

export type tableData = {
  createFormSchema: formModifier;
  editFormSchema: formModifier;
  tableSchema: formModifier;
  filterBy: string;
};

export const dataConfig: Record<string, any> = {
  admin: {
    displayName: "Admin Management",
    default: "languages",
    languages: {
      filterBy: "displayName",
      createFormSchema: {
        formPositions: ["displayName", "flagIcon", "cultureName"],
        schema: $Volo_Abp_LanguageManagement_Dto_CreateLanguageDto,
      },
      tableSchema: {
        schema: $Volo_Abp_LanguageManagement_Dto_LanguageDto,
        excludeList: ["id", "concurrencyStamp"],
      },
      editFormSchema: {
        formPositions: ["displayName", "flagIcon", "cultureName"],
        schema: $Volo_Abp_LanguageManagement_Dto_UpdateLanguageDto,
      },
    },
  },
  saas: {
    displayName: "Saas Management",
    default: "edition",
    edition: {
      filterBy: "displayName",
      createFormSchema: {
        formPositions: ["displayName"],
        schema: $Volo_Saas_Host_Dtos_EditionCreateDto,
      },
      editFormSchema: {
        formPositions: ["displayName"],
        schema: $Volo_Saas_Host_Dtos_EditionUpdateDto,
      },
      tableSchema: {
        excludeList: ["planId", "id", "planId", "concurrencyStamp"],
        schema: $Volo_Saas_Host_Dtos_EditionDto,
      },
    },
    tenant: {
      filterBy: "name",
      createFormSchema: {
        formPositions: [
          "name",
          "editionId",
          "adminEmailAddress",
          "adminPassword",
          "activationState",
          "activationEndDate",
        ],
        schema: $Volo_Saas_Host_Dtos_SaasTenantCreateDto,
        convertors: {
          activationState: {
            data: ["Active", "Active with limited time", "Passive"],
            type: "enum",
          },
          editionId: {
            data: () => {
              return fetch(getBaseLink("api/admin/edition")).then((data) =>
                data.json()
              );
            },
            get: "displayName",
            post: "id",
            type: "async",
          },
        },
        dependencies: [
          {
            sourceField: "activationState",
            type: DependencyType.HIDES,
            targetField: "activationEndDate",
            when: (activationState: string) =>
              activationState !== "Active with limited time",
          },
        ],
      },
      tableSchema: {
        schema: $Volo_Saas_Host_Dtos_SaasTenantDto,
        excludeList: ["id", "concurrencyStamp", "editionId"],
        convertors: {
          activationState: {
            data: ["Active", "Active with limited time", "Passive"],
            type: "enum",
          },
          editionId: {
            data: async () => {
              return await fetch(getBaseLink("api/admin/edition")).then(
                (data) => data.json()
              );
            },
            covertTo: "editionName",
            get: "displayName",
            post: "id",
            type: "async",
          },
        },
      },
      editFormSchema: {
        formPositions: [
          "name",
          "editionId",
          "activationState",
          "activationEndDate",
        ],
        schema: $Volo_Saas_Host_Dtos_SaasTenantUpdateDto,
        convertors: {
          activationState: {
            data: ["Active", "Active with limited time", "Passive"],
            type: "enum",
          },
          editionId: {
            data: async () => {
              return await fetch(getBaseLink("api/admin/edition")).then(
                (data) => data.json()
              );
            },
            covertTo: "editionName",
            get: "displayName",
            post: "id",
            type: "async",
          },
        },

        dependencies: [
          {
            sourceField: "activationState",
            type: DependencyType.HIDES,
            targetField: "activationEndDate",
            when: (activationState: string) =>
              activationState !== "Active with limited time",
          },
        ],
      },
    },
  },
  identity: {
    displayName: "Identity Management",
    default: "role",
    role: {
      createFormSchema: {
        formPositions: ["name", "isDefault", "isPublic"],
        schema: $Volo_Abp_Identity_IdentityRoleCreateDto,
      },
      editFormSchema: {
        formPositions: ["name", "isDefault", "isPublic"],
        schema: $Volo_Abp_Identity_IdentityRoleUpdateDto,
      },
      tableSchema: {
        excludeList: ["id", "extraProperties", "concurrencyStamp"],
        schema: $Volo_Abp_Identity_IdentityRoleDto,
      },
      filterBy: "name",
    },
    user: {
      createFormSchema: {
        formPositions: ["email", "password", "userName"],
        schema: $Volo_Abp_Identity_IdentityUserCreateDto,
      },
      editFormSchema: {
        formPositions: ["email", "userName"],
        schema: $Volo_Abp_Identity_IdentityUserUpdateDto,
      },
      tableSchema: {
        excludeList: ["id", "extraProperties", "concurrencyStamp"],
        schema: $Volo_Abp_Identity_IdentityUserDto,
      },
      filterBy: "email",
    },

    claimType: {
      filterBy: "displayName",
      createFormSchema: {
        formPositions: [
          "name",
          "required",
          "regex",
          "regexDescription",
          "description",
          "valueType",
        ],
        schema: $Volo_Abp_Identity_CreateClaimTypeDto,
        convertors: {
          valueType: {
            data: ["String", "Int", "Boolean", "DateTime"],
            type: "enum",
          },
        },
      },
      tableSchema: {
        excludeList: [
          "id",
          "concurrencyStamp",
          "regexDescription",
          "extraProperties",
          "valueTypeAsString",
        ],
        schema: $Volo_Abp_Identity_ClaimTypeDto,
        convertors: {
          valueType: {
            data: ["String", "Int", "Boolean", "DateTime"],
            type: "enum",
          },
        },
      },
      editFormSchema: {
        formPositions: [
          "name",
          "required",
          "regex",
          "regexDescription",
          "description",
          "valueType",
        ],
        schema: $Volo_Abp_Identity_UpdateClaimTypeDto,
        convertors: {
          valueType: {
            data: ["String", "Int", "Boolean", "DateTime"],
            type: "enum",
          },
        },
      },
    },
  },
};