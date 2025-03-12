<template>
  <v-dialog v-model="visible" max-width="800px" persistent>
    <v-card class="dark-theme">
      <v-card-title class="title">新增健身方案</v-card-title>
      <v-card-text>
        <!-- 方案名稱 -->
        <v-text-field
          v-model="newPlan.name"
          label="方案名稱"
          color="orange"
          outlined
          required
        />

        <!-- 方案描述 -->
        <v-textarea
          v-model="newPlan.description"
          label="方案描述"
          color="orange"
          outlined
          required
        />

        <!-- 方案細則 -->
        <div class="plan-details">
          <h3 class="details-title">方案細則</h3>
          <div
            v-for="(detail, index) in newPlan.planDetails"
            :key="index"
            class="detail-item"
          >
            <v-select
              v-model="detail.actionId"
              :items="
                filteredActions.concat(getSelectedActions(detail.actionId))
              "
              item-title="name"
              item-value="id"
              label="動作"
              dense
              outlined
              color="orange"
              clearable
              required
            />
            <v-text-field
              v-model="detail.sets"
              label="組數"
              type="number"
              dense
              outlined
              color="orange"
              min="1"
              required
            />
            <v-text-field
              v-model="detail.reps"
              label="一組次數"
              type="number"
              dense
              outlined
              color="orange"
              min="1"
              required
            />
            <v-btn icon color="red" @click="removeDetail(index)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
          <!-- 新增細則按鈕 -->
          <v-btn @click="addDetail" class="add-detail-btn">
            新增方案細則
          </v-btn>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="total-calories">消耗總熱量：{{ totalCalories }} cal</div>
        <v-btn color="red" @click="handleClose">取消</v-btn>
        <v-btn class="save-btn" @click="saveChanges">儲存</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  actions: Array, // 可選的動作列表
  memberId: Number, // 當前會員的 ID
});
const emit = defineEmits(["close", "save"]);

const visible = ref(true);
const newPlan = ref({
  name: "",
  description: "",
  planDetails: [],
  isPublic: 0, // 預設為私人
});

const getSelectedActions = (actionId) => {
  const selectedAction = props.actions.find((action) => action.id === actionId);
  return selectedAction ? [selectedAction] : [];
};

const filteredActions = computed(() => {
  const selectedActionIds = newPlan.value.planDetails.map(
    (detail) => detail.actionId
  );
  return props.actions.filter(
    (action) => !selectedActionIds.includes(action.id)
  );
});

const totalCalories = computed(() => {
  return newPlan.value.planDetails.reduce((total, detail) => {
    const action = props.actions.find(
      (action) => action.id === detail.actionId
    );
    return (
      total + (action?.calories || 0) * (detail.sets || 1) * (detail.reps || 1)
    );
  }, 0);
});

const saveChanges = () => {
  const createdPlan = {
    name: newPlan.value.name,
    description: newPlan.value.description,
    planDetails: newPlan.value.planDetails.map((detail) => ({
      actionId: detail.actionId,
      sets: detail.sets,
      reps: detail.reps,
    })),
    isPublic: 0, // 預設不公開
    memberId: props.memberId,
  };

  emit("save", createdPlan); // 確保傳遞的數據格式符合後端需求
};

const addDetail = () => {
  newPlan.value.planDetails.push({
    actionId: null,
    sets: 1,
    reps: 1,
  });
};

const removeDetail = (index) => {
  newPlan.value.planDetails.splice(index, 1);
};

const handleClose = () => {
  emit("close");
};
</script>

<style scoped>
.dark-theme {
  background-color: #1e1e1e;
  color: white;
}

.title {
  font-weight: bold;
  text-align: center;
  color: #ff961e;
}

.plan-details {
  margin-top: 20px;
}

.details-title {
  color: #ff961e;
  margin-bottom: 10px;
  font-weight: bold;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.add-detail-btn {
  margin-top: 15px;
  background-color: #ff961e;
  color: white;
}

.add-detail-btn:hover {
  background-color: #ffa540;
}

.save-btn {
  background-color: #ff961e;
  color: white;
}

.save-btn:hover {
  background-color: #ffa540;
}

.v-card {
  border-radius: 12px;
}

.total-calories {
  margin-right: auto;
  font-weight: bold;
  color: #ff961e;
}
</style>
