$image = "registry.cn-shanghai.aliyuncs.com/fisschl/translate:latest"

docker build -t $image .
docker push $image
