package hackbeanpot.com.gamepackcast;

import android.app.Application;

import com.google.android.gms.common.api.GoogleApiClient;

/**
 * Created by matcp_000 on 1/23/2016.
 */
public class MyApplication extends Application {
    private GoogleApiClient mApiClient;
    private MainActivity.HelloWorldChannel mHelloWorldChannel;


    public MainActivity.HelloWorldChannel getmHelloWorldChannel() {
        return mHelloWorldChannel;
    }

    public void setmHelloWorldChannel(MainActivity.HelloWorldChannel mHelloWorldChannel) {
        this.mHelloWorldChannel = mHelloWorldChannel;
    }

    public GoogleApiClient getmApiClient() {
        return mApiClient;
    }

    public void setmApiClient(GoogleApiClient mApiClient) {
        this.mApiClient = mApiClient;
    }
}
