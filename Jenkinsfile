node ('master') {
    stage 'Checkout'
    echo 'Checkout'
    // Get code from a GitHub repository
    git branch: 'completed-testing', credentialsId: 'verpix-viewer_deploy-key', url: 'git@github.com:uniray7/verpix-viewer.git'

   withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', accessKeyVariable: 'AWS_ACCESS_KEY_ID', credentialsId: 'verpix-viewer-S3', secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'], usernamePassword(credentialsId: 'saucelab_key', passwordVariable: 'SAUCE_ACCESS_KEY', usernameVariable: 'SAUCE_USERNAME')]) {
    //stage 'Build & Unit test & PUSH to S3'
    stage 'Setup image'
    echo 'Setup image'
    def img = docker.build('verpix-viewer', ' ./');

    withDockerContainer(args: '-u root', image: 'verpix-viewer') {
        stage 'npm install'
        echo 'npm install'
        sh "npm install"
        
        stage 'Test'
        echo 'Test'
        sh 'npm run test:completed'
        
        stage 'Build'
        echo 'Build'
        sh 'npm run build'

        stage 'Push to S3'
        echo 'Push to S3'
        sh 'export AWS_DEFAULT_REGION=ap-pacific-1'
        sh 'aws s3 cp --acl public-read public/dist/sdk.js "s3://verpixplus-dev/"'
    }

    // remove image
    sh "docker rmi "+img.imageName();
   }

}

