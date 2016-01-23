package hackbeanpot.com.gamepackcast;

import android.app.Activity;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.service.carrier.CarrierMessagingService;
import android.support.v4.view.MenuItemCompat;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.app.MediaRouteActionProvider;
import android.support.v7.media.MediaRouteSelector;
import android.support.v7.media.MediaRouter;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Button;
import android.widget.Toast;

import com.google.android.gms.cast.ApplicationMetadata;
import com.google.android.gms.cast.Cast;
import com.google.android.gms.cast.CastDevice;
import com.google.android.gms.cast.CastMediaControlIntent;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Status;

import java.io.IOException;

/**
 * Created by matcp_000 on 1/22/2016.
 */
public class MainActivity extends AppCompatActivity {
//    private MediaRouter mRouter;
//    private MediaRouter.Callback mCallback;
//    private MediaRouteSelector mSelector;
//    private static final String TAG = MainActivity.class.getSimpleName();
//
//    private static final int REQUEST_CODE = 1;
//
//    private MediaRouter mMediaRouter;
//    private MediaRouteSelector mMediaRouteSelector;
//    private MediaRouter.Callback mMediaRouterCallback;
//    private CastDevice mSelectedDevice;
//    private GoogleApiClient mApiClient;
//    private Cast.Listener mCastListener;
//    private ConnectionCallbacks mConnectionCallbacks;
//    private boolean mApplicationStarted;
//    private boolean mWaitingForReconnect;
//    private String mSessionId;
//
//    protected void onCreate(Bundle savedInstanceState) {
//        super.onCreate(savedInstanceState);
//
//        mRouter = MediaRouter.getInstance(this);
//        mSelector = new MediaRouteSelector.Builder()
//                .addControlCategory(CastMediaControlIntent.categoryForCast("D2E6DFBD"))
//                .build();
//        mCallback = new MyCallback();
//    }
//    // Add the callback on start to tell the media router what kinds of routes
//    // the application is interested in so that it can try to discover suitable ones.
//    public void onStart() {
//        super.onStart();
//
//        mRouter.addCallback(mSelector, mCallback,
//                MediaRouter.CALLBACK_FLAG_REQUEST_DISCOVERY);
//
//        MediaRouter.RouteInfo route = mRouter.updateSelectedRoute(mSelector);
//        // do something with the route...
//    }
//
//    // Remove the selector on stop to tell the media router that it no longer
//    // needs to invest effort trying to discover routes of these kinds for now.
//    public void onStop() {
//        super.onStop();
//
//        mRouter.removeCallback(mCallback);
//    }
//
//    public boolean onCreateOptionsMenu(Menu menu) {
//        super.onCreateOptionsMenu(menu);
//
//        getMenuInflater().inflate(R.menu.menu, menu);
//
//        MenuItem mediaRouteMenuItem = menu.findItem(R.id.media_route_menu_item);
//        MediaRouteActionProvider mediaRouteActionProvider =
//                (MediaRouteActionProvider)MenuItemCompat.getActionProvider(mediaRouteMenuItem);
//        mediaRouteActionProvider.setRouteSelector(mSelector);
//        return true;
//    }
//
//    private final class MyCallback extends MediaRouter.Callback {
//        // Implement callback methods as needed.
//
//        @Override
//        public void onRouteSelected(MediaRouter router, MediaRouter.RouteInfo info) {
//            mSelectedDevice = CastDevice.getFromBundle(info.getExtras());
//            String routeId = info.getId();
//        }
//
//        @Override
//        public void onRouteUnselected(MediaRouter router, MediaRouter.RouteInfo info) {
//            //teardown();
//            mSelectedDevice = null;
//        }
//    }
//
//    /**
//     * Start the receiver app
//     */
//    private void launchReceiver() {
//        try {
//            mCastListener = new Cast.Listener() {
//
//                @Override
//                public void onApplicationDisconnected(int errorCode) {
//                    Log.d(TAG, "application has stopped");
//                    teardown(true);
//                }
//
//            };
//            // Connect to Google Play services
//            mConnectionCallbacks = new GoogleApiClient.ConnectionCallbacks();
//            //mConnectionFailedListener = new ConnectionFailedListener();
//            Cast.CastOptions.Builder apiOptionsBuilder = Cast.CastOptions
//                    .builder(mSelectedDevice, mCastListener);
//            mApiClient = new GoogleApiClient.Builder(this)
//                    .addApi(Cast.API, apiOptionsBuilder.build())
//                    .addConnectionCallbacks(mConnectionCallbacks)
//                    //.addOnConnectionFailedListener(mConnectionFailedListener)
//                    .build();
//
//            mApiClient.connect();
//        } catch (Exception e) {
//            Log.e(TAG, "Failed launchReceiver", e);
//        }
//    }
//
//    /**
//     * Tear down the connection to the receiver
//     */
//    private void teardown(boolean selectDefaultRoute) {
//        Log.d(TAG, "teardown");
//        if (mApiClient != null) {
//            if (mApplicationStarted) {
//                if (mApiClient.isConnected() || mApiClient.isConnecting()) {
//                    try {
//                        Cast.CastApi.stopApplication(mApiClient, mSessionId);
//                        if (mHelloWorldChannel != null) {
//                            Cast.CastApi.removeMessageReceivedCallbacks(
//                                    mApiClient,
//                                    mHelloWorldChannel.getNamespace());
//                            mHelloWorldChannel = null;
//                        }
//                    } catch (IOException e) {
//                        Log.e(TAG, "Exception while removing channel", e);
//                    }
//                    mApiClient.disconnect();
//                }
//                mApplicationStarted = false;
//            }
//            mApiClient = null;
//        }
//        if (selectDefaultRoute) {
//            mMediaRouter.selectRoute(mMediaRouter.getDefaultRoute());
//        }
//        mSelectedDevice = null;
//        mWaitingForReconnect = false;
//        mSessionId = null;
//    }
private static final String TAG = MainActivity.class.getSimpleName();

    private static final int REQUEST_CODE = 1;

    private MediaRouter mMediaRouter;
    private MediaRouteSelector mMediaRouteSelector;
    private MediaRouter.Callback mMediaRouterCallback;
    private CastDevice mSelectedDevice;
    private GoogleApiClient mApiClient;
    private Cast.Listener mCastListener;
    private ConnectionCallbacks mConnectionCallbacks;
    private ConnectionFailedListener mConnectionFailedListener;
    private HelloWorldChannel mHelloWorldChannel;
    private boolean mApplicationStarted;
    private boolean mWaitingForReconnect;
    private String mSessionId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        ActionBar actionBar = getSupportActionBar();
        actionBar.setBackgroundDrawable(new ColorDrawable(
                getResources().getColor(android.R.color.transparent)));

        // Configure Cast device discovery
        mMediaRouter = MediaRouter.getInstance(getApplicationContext());
        mMediaRouteSelector = new MediaRouteSelector.Builder()
                .addControlCategory(CastMediaControlIntent.categoryForCast(getResources()
                        .getString(R.string.app_id))).build();
        mMediaRouterCallback = new MyMediaRouterCallback();
    }

    @Override
    protected void onStart() {
        super.onStart();
        // Start media router discovery
        mMediaRouter.addCallback(mMediaRouteSelector, mMediaRouterCallback,
                MediaRouter.CALLBACK_FLAG_REQUEST_DISCOVERY);
    }

    @Override
    protected void onStop() {
        // End media router discovery
        mMediaRouter.removeCallback(mMediaRouterCallback);
        super.onStop();
    }

    @Override
    public void onDestroy() {
        Log.d(TAG, "onDestroy");
        teardown(true);
        super.onDestroy();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        super.onCreateOptionsMenu(menu);
        getMenuInflater().inflate(R.menu.menu, menu);
        MenuItem mediaRouteMenuItem = menu.findItem(R.id.media_route_menu_item);
        MediaRouteActionProvider mediaRouteActionProvider
                = (MediaRouteActionProvider) MenuItemCompat
                .getActionProvider(mediaRouteMenuItem);
        // Set the MediaRouteActionProvider selector for device discovery.
        mediaRouteActionProvider.setRouteSelector(mMediaRouteSelector);
        return true;
    }

    /**
     * Callback for MediaRouter events
     */
    private class MyMediaRouterCallback extends MediaRouter.Callback {

        @Override
        public void onRouteSelected(MediaRouter router, MediaRouter.RouteInfo info) {
            Log.d(TAG, "onRouteSelected");
            // Handle the user route selection.
            mSelectedDevice = CastDevice.getFromBundle(info.getExtras());

            launchReceiver();
        }

        @Override
        public void onRouteUnselected(MediaRouter router, MediaRouter.RouteInfo info) {
            Log.d(TAG, "onRouteUnselected: info=" + info);
            teardown(false);
            mSelectedDevice = null;
        }
    }

    /**
     * Start the receiver app
     */
    private void launchReceiver() {
        try {
            mCastListener = new Cast.Listener() {

                @Override
                public void onApplicationDisconnected(int errorCode) {
                    Log.d(TAG, "application has stopped");
                    teardown(true);
                }

            };
            // Connect to Google Play services
            mConnectionCallbacks = new ConnectionCallbacks();
            mConnectionFailedListener = new ConnectionFailedListener();
            Cast.CastOptions.Builder apiOptionsBuilder = Cast.CastOptions
                    .builder(mSelectedDevice, mCastListener);
            mApiClient = new GoogleApiClient.Builder(this)
                    .addApi(Cast.API, apiOptionsBuilder.build())
                    .addConnectionCallbacks(mConnectionCallbacks)
                    .addOnConnectionFailedListener(mConnectionFailedListener)
                    .build();

            mApiClient.connect();
        } catch (Exception e) {
            Log.e(TAG, "Failed launchReceiver", e);
        }
    }

    /**
     * Google Play services callbacks
     */
    private class ConnectionCallbacks implements
            GoogleApiClient.ConnectionCallbacks {

        @Override
        public void onConnected(Bundle connectionHint) {
            Log.d(TAG, "onConnected");

            if (mApiClient == null) {
                // We got disconnected while this runnable was pending
                // execution.
                return;
            }

            try {
                if (mWaitingForReconnect) {
                    mWaitingForReconnect = false;

                    // Check if the receiver app is still running
                    if ((connectionHint != null)
                            && connectionHint.getBoolean(Cast.EXTRA_APP_NO_LONGER_RUNNING)) {
                        Log.d(TAG, "App  is no longer running");
                        teardown(true);
                    } else {
                        // Re-create the custom message channel
                        try {
                            Cast.CastApi.setMessageReceivedCallbacks(
                                    mApiClient,
                                    mHelloWorldChannel.getNamespace(),
                                    mHelloWorldChannel);
                        } catch (IOException e) {
                            Log.e(TAG, "Exception while creating channel", e);
                        }
                    }
                } else {
                    // Launch the receiver app
                    Cast.CastApi.launchApplication(mApiClient, getString(R.string.app_id), false)
                            .setResultCallback(
                                    new ResultCallback<Cast.ApplicationConnectionResult>() {
                                        @Override
                                        public void onResult(
                                                Cast.ApplicationConnectionResult result) {
                                            Status status = result.getStatus();
                                            Log.d(TAG,
                                                    "ApplicationConnectionResultCallback.onResult:"
                                                            + status.getStatusCode());
                                            if (status.isSuccess()) {
                                                ApplicationMetadata applicationMetadata = result
                                                        .getApplicationMetadata();
                                                mSessionId = result.getSessionId();
                                                String applicationStatus = result
                                                        .getApplicationStatus();
                                                boolean wasLaunched = result.getWasLaunched();
                                                Log.d(TAG, "application name: "
                                                        + applicationMetadata.getName()
                                                        + ", status: " + applicationStatus
                                                        + ", sessionId: " + mSessionId
                                                        + ", wasLaunched: " + wasLaunched);
                                                mApplicationStarted = true;

                                                // Create the custom message
                                                // channel
                                                mHelloWorldChannel = new HelloWorldChannel();
                                                try {
                                                    Cast.CastApi.setMessageReceivedCallbacks(
                                                            mApiClient,
                                                            mHelloWorldChannel.getNamespace(),
                                                            mHelloWorldChannel);
                                                } catch (IOException e) {
                                                    Log.e(TAG, "Exception while creating channel",
                                                            e);
                                                }

                                                // set the initial instructions
                                                // on the receiver
                                                sendMessage(getString(R.string.instructions));
                                            } else {
                                                Log.e(TAG, "application could not launch");
                                                teardown(true);
                                            }
                                        }
                                    });
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to launch application", e);
            }
        }

        @Override
        public void onConnectionSuspended(int cause) {
            Log.d(TAG, "onConnectionSuspended");
            mWaitingForReconnect = true;
        }
    }

    /**
     * Google Play services callbacks
     */
    private class ConnectionFailedListener implements
            GoogleApiClient.OnConnectionFailedListener {

        @Override
        public void onConnectionFailed(ConnectionResult result) {
            Log.e(TAG, "onConnectionFailed ");

            teardown(false);
        }
    }

    /**
     * Tear down the connection to the receiver
     */
    private void teardown(boolean selectDefaultRoute) {
        Log.d(TAG, "teardown");
        if (mApiClient != null) {
            if (mApplicationStarted) {
                if (mApiClient.isConnected() || mApiClient.isConnecting()) {
                    try {
                        Cast.CastApi.stopApplication(mApiClient, mSessionId);
                        if (mHelloWorldChannel != null) {
                            Cast.CastApi.removeMessageReceivedCallbacks(
                                    mApiClient,
                                    mHelloWorldChannel.getNamespace());
                            mHelloWorldChannel = null;
                        }
                    } catch (IOException e) {
                        Log.e(TAG, "Exception while removing channel", e);
                    }
                    mApiClient.disconnect();
                }
                mApplicationStarted = false;
            }
            mApiClient = null;
        }
        if (selectDefaultRoute) {
            mMediaRouter.selectRoute(mMediaRouter.getDefaultRoute());
        }
        mSelectedDevice = null;
        mWaitingForReconnect = false;
        mSessionId = null;
    }

    /**
     * Send a text message to the receiver
     */
    private void sendMessage(String message) {
        if (mApiClient != null && mHelloWorldChannel != null) {
            try {
                Cast.CastApi.sendMessage(mApiClient,
                        mHelloWorldChannel.getNamespace(), message).setResultCallback(
                        new ResultCallback<Status>() {
                            @Override
                            public void onResult(Status result) {
//                                ApplicationMetadata applicationMetadata =
//                                        result.getApplicationMetadata();
//                                String sessionId = result.getSessionId();
//                                String applicationStatus = result.getApplicationStatus();
//                                boolean wasLaunched = result.getWasLaunched();

                                mApplicationStarted = true;

                                mHelloWorldChannel = new HelloWorldChannel();
                                try {
                                    Cast.CastApi.setMessageReceivedCallbacks(mApiClient,
                                            mHelloWorldChannel.getNamespace(),
                                            mHelloWorldChannel);
                                    Log.e(TAG, "we connected and sent the message");
                                    Log.i(TAG, "msg sent");
                                } catch (IOException e) {
                                    Log.e(TAG, "Exception while creating channel", e);
                                }
                            }
                        });
            } catch (Exception e) {
                Log.e(TAG, "Exception while sending message", e);
            }
        } else {
            Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * Custom message channel
     */
    class HelloWorldChannel implements Cast.MessageReceivedCallback {

        /**
         * @return custom namespace
         */
        public String getNamespace() {
            return getString(R.string.namespace);
        }

        /*
         * Receive message from the receiver app
         */
        @Override
        public void onMessageReceived(CastDevice castDevice, String namespace,
                                      String message) {
            Log.d(TAG, "onMessageReceived: " + message);
        }

        private void sendMessage(String message) {
            if (mApiClient != null && mHelloWorldChannel != null) {
                try {
                    Cast.CastApi.sendMessage(mApiClient, mHelloWorldChannel.getNamespace(), message)
                            .setResultCallback(
                                    new ResultCallback<Status>() {
                                        @Override
                                        public void onResult(Status result) {
                                            if (!result.isSuccess()) {
                                                Log.e(TAG, "Sending message failed");
                                            }
                                        }
                                    });
                } catch (Exception e) {
                    Log.e(TAG, "Exception while sending message", e);
                }
            }
        }
    }
}
