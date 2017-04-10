#This dockerfile uses the ubuntu image
FROM 825953773834.dkr.ecr.ap-northeast-1.amazonaws.com/base

MAINTAINER uniray7 uniray7@gmail.com

# install aws cli
RUN apt-get install -y python-pip
RUN pip install awscli

# install nodejs
ENV NODE_VERSION 6.3.1
ENV NVM_DIR /home/.nvm

RUN . $NVM_DIR/nvm.sh && nvm install v$NODE_VERSION && nvm alias default v$NODE_VERSION
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

#install pm2
RUN npm install -g pm2

# cp project
ADD . /home/verpix/verpix-viewer
RUN chown -R verpix:verpix /home/verpix/verpix-viewer

# npm install
USER verpix
WORKDIR /home/verpix/verpix-viewer
RUN npm install




## set S3 for storing SDK
#ARG BKT_NAME
#ENV BKT_NAME=$BKT_NAME
## add secret key for sauceLab
#ARG SAUCE_USERNAME
#ARG SAUCE_ACCESS_KEY
#ENV SAUCE_USERNAME $SAUCE_USERNAME
#ENV SAUCE_ACCESS_KEY $SAUCE_ACCESS_KEY
#
## run unit test & cross browser test
#RUN npm run test:completed
#
## add .aws/credentials
#ARG AWS_KEY
#ARG AWS_SECRET
#
#RUN mkdir ~/.aws
#RUN touch ~/.aws/credentials
#RUN echo "[default]" >> ~/.aws/credentials
#RUN echo "aws_access_key_id=$AWS_KEY" >>  ~/.aws/credentials
#RUN echo "aws_secret_access_key=$AWS_SECRET" >> ~/.aws/credentials
#
## build
#RUN npm run build
#
## cp to S3 bucket for storing dev version SDK
#RUN aws s3 cp --acl public-read public/dist/sdk.js "s3://$BKT_NAME/"
