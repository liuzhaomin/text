/* 原型正式标注唯一数据源；由 prototype-author 编辑器维护。 */
window.__PROTOTYPE_NOTES__ = {
  "schemaVersion": 2,
  "state": {
    "kb.page": "list",
    "kb.layers": [],
    "kb.tab": "all",
    "kb.list": "loaded"
  },
  "activeScenario": "default",
  "scenarios": {
    "default": {
      "state": {}
    },
    "upload": {
      "state": {
        "kb.layers": [
          "upload"
        ]
      }
    },
    "preview": {
      "state": {
        "kb.layers": [
          "preview"
        ]
      }
    },
    "empty": {
      "state": {
        "kb.list": "empty"
      }
    }
  },
  "header": {
    "title": "职场知识库管理",
    "subtitle": "文档上传、下载、预览、删除与分类管理"
  },
  "cards": [
    {
      "id": "kb-overview",
      "title": "知识库概览",
      "body": "顶部统计区展示文档总数、今日新增、存储用量与待审核数量，帮助管理者快速掌握知识库整体状态。",
      "target": {
        "anchor": "uiStats"
      }
    },
    {
      "id": "kb-category",
      "title": "分类导航",
      "body": "左侧以分类树组织知识库层级（规章制度 / 培训资料 / 项目文档 / 产品资料），点击叶子节点按分类筛选文档；折叠按钮控制分组展开。",
      "target": {
        "anchor": "uiKbTree"
      }
    },
    {
      "id": "kb-filter",
      "title": "筛选与查询",
      "body": "按关键词（名称 / 创建人）、文档类型与状态组合筛选；查询提交结果、重置清空条件。筛选条件与表格结果共同构成列表态。",
      "target": {
        "anchor": "uiFilter",
        "when": {
          "kb.layers": []
        }
      }
    },
    {
      "id": "kb-upload",
      "title": "上传文档",
      "body": "主操作入口。点击打开上传弹窗，支持拖拽 / 选择文件、填写名称分类标签与描述，并实时显示上传进度。",
      "target": {
        "anchor": "uiToolbarUpload",
        "when": {
          "kb.layers": []
        }
      }
    },
    {
      "id": "kb-batch",
      "title": "批量与导出",
      "body": "勾选多行后「批量删除」可一次移除；「导出清单」将当前列表导出为 CSV。列表态下提供刷新与已选计数。",
      "target": {
        "anchor": "uiToolbarBatchDelete",
        "when": {
          "kb.layers": []
        }
      }
    },
    {
      "id": "kb-table",
      "title": "文档列表",
      "body": "表格展示文档名称、类型、分类、创建人、更新时间与状态；支持行选择、分页浏览。无匹配结果时显示空状态。",
      "target": {
        "anchor": "uiDataTable",
        "when": {
          "kb.layers": []
        }
      }
    },
    {
      "id": "kb-rowops",
      "title": "行内操作：预览 / 下载 / 删除",
      "body": "每行提供预览（打开右侧抽屉）、下载（导出文件）与删除（二次确认）操作；同类操作仅在代表行标记交互闪电。",
      "target": {
        "anchor": "uiDocRowActions",
        "when": {
          "kb.layers": []
        }
      }
    },
    {
      "id": "kb-delete",
      "title": "删除二次确认",
      "body": "删除为危险操作，点击后弹出气泡确认，避免误删；确认后从列表移除并给出反馈提示。",
      "target": {
        "anchor": "uiDeletePopconfirm",
        "when": {
          "kb.layers": []
        }
      }
    },
    {
      "id": "kb-pagination",
      "title": "分页",
      "body": "列表数据分页展示，显示总条数与当前页码，支持上一页 / 下一页翻页。",
      "target": {
        "anchor": "uiPagination",
        "when": {
          "kb.layers": []
        }
      }
    },
    {
      "id": "kb-upload-modal",
      "title": "上传弹窗与进度",
      "body": "弹窗内拖拽或选择文件后，列表项显示上传进度；填写元信息并确认即入库。遮罩仅覆盖左侧产品区，不影响右侧说明。",
      "target": {
        "anchor": "uiUploadModalPanel",
        "when": {
          "kb.layers.includes": "upload"
        }
      }
    },
    {
      "id": "kb-preview-drawer",
      "title": "预览抽屉",
      "body": "从右侧抽屉展示文档元信息（类型 / 大小 / 分类 / 创建人 / 状态）与在线预览区，并提供下载入口。",
      "target": {
        "anchor": "uiPreviewDrawerPanel",
        "when": {
          "kb.layers.includes": "preview"
        }
      }
    }
  ]
};
