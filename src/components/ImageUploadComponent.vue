<script setup lang="ts">

import {Plus} from "@element-plus/icons-vue";
import {ref} from "vue";
import {useCurrentData} from "@/stores/currentData"
import {storeToRefs} from "pinia";

const data = useCurrentData()

const img = storeToRefs(data).img

const dialogImageUrl = ref('')
const dialogVisible = ref(false)

const handleRemove = (uploadFile, uploadFiles) => {
  console.log(uploadFile, uploadFiles)
}

const handlePictureCardPreview = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url
  dialogVisible.value = true
}

const resizeImage = (imageSrc) => new Promise((resolve) => {
  const img = new Image();
  img.src = imageSrc;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const maxSize = 1200;
    let {width, height} = img;
    if (width > height) {
      if (width > maxSize) {
        height *= maxSize / width;
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width *= maxSize / height;
        height = maxSize;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    resolve(canvas.toDataURL('image/jpeg', 0.8));
  };
});

const beforeUpload = async (uploadFile) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    const resizedImage = await resizeImage(e.target.result);
    img.value.push({
      name: uploadFile.name,
      url: resizedImage,
      status: 'success',
    });
  };
  reader.readAsDataURL(uploadFile);
  return false; // 阻止默认的上传行为
};


</script>

<template>


  <el-card>
    <template #header>
      <div class="card-header">
        <h3>{{ $t('ui.photo.title') }}</h3>
      </div>
    </template>
    <el-upload
        v-model:file-list="img"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :before-upload="beforeUpload"
    >
      <el-icon>
        <Plus/>
      </el-icon>
    </el-upload>

    <el-dialog v-model="dialogVisible">
      <img w-full :src="dialogImageUrl" alt="Preview Image"/>
    </el-dialog>
  </el-card>
</template>

<style scoped>

</style>