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
