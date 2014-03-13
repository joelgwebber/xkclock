package com.j15r.xkclock;

import android.content.Context;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;

import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.TimeZone;

public class ClockView extends View {
  private static final float TAU = (float)Math.PI * 2;

  private Bitmap outer;
  private Bitmap inner;
  private int myZone = -5;

  public ClockView(Context context, AttributeSet attrs) {
    super(context, attrs);
    outer = BitmapFactory.decodeResource(getResources(), R.drawable.outer);
    inner = BitmapFactory.decodeResource(getResources(), R.drawable.inner);
  }

  @Override
  public boolean onTouchEvent(MotionEvent event) {
    int hour = hour(), minute = minute();

    float size = getWidth() > getHeight() ? getHeight() : getWidth();
    float halfSize = size/2;

    float x = event.getX() - (halfSize), y = event.getY() - (halfSize);
    float angle = -TAU/4 - (float)Math.atan2(-y, x);
    setZone(Math.round(angle * 24 / TAU - (minute / 60)) - hour);
    return true;
  }

  protected void onDraw(Canvas canvas) {
    int hour = hour(), minute = minute();

    float size = canvas.getWidth() > canvas.getHeight() ? canvas.getHeight() : canvas.getWidth();
    float halfSize = size/2;

    canvas.save();
    Paint clearPaint = new Paint();
    clearPaint.setColor(0);
    canvas.drawRect(0, 0, size, size, clearPaint);
    canvas.translate(halfSize, halfSize);

    // Outer ring.
    Paint imagePaint = new Paint();
    canvas.save();
    canvas.scale(0.994f, 0.994f); // inner image was a bit off, and code is easier than photoshop
    canvas.drawBitmap(outer, new Rect(0, 0, outer.getWidth(), outer.getHeight()), new RectF(-halfSize, -halfSize, halfSize, halfSize), imagePaint);
    canvas.restore();

    canvas.translate(0f, -size*.005f); // The inside is all slightly off-kilter. Again, code over photoshop.

    // Inner ring, rotated.
    canvas.save();
    canvas.rotate((TAU/2 + timeInRadians(hour, minute)) * 360f / TAU);
    canvas.drawBitmap(inner, new Rect(0, 0, inner.getWidth(), inner.getHeight()), new RectF(-halfSize*.855f, -halfSize*.855f, halfSize*.855f, halfSize*.855f), imagePaint);
    canvas.restore();

    // Timezone wedge.
    Paint wedgePaint = new Paint();
    wedgePaint.setColor(0x400000ff);
    float r = halfSize*0.855f;
    float alpha = (TAU/4 + timeInRadians(hour + myZone, minute - 30)) * 360f / TAU;
    canvas.drawArc(new RectF(-r, -r, r, r), alpha, 360f / 24f, true, wedgePaint);

    // Time text.
    int realHour = hour + myZone;
    if (realHour < 0) realHour += 24;
    String text = (realHour % 24) + ":" + pad1(minute);
    Paint textPaint = new Paint();
    textPaint.setColor(Color.BLUE);
    textPaint.setStrokeWidth(8);
    Typeface helvetica = Typeface.create("Helvetica", Typeface.BOLD);
    textPaint.setTypeface(helvetica);
    textPaint.setTextSize(40);
    float width = textPaint.measureText(text);
    canvas.drawText(text, -width/2, 10, textPaint);

    canvas.restore();
  }

  private void setZone(int zone) {
    if (zone == myZone) return;
    myZone = zone % 24;
    this.invalidate();
  }

  private int hour() {
    return now().get(Calendar.HOUR_OF_DAY);
  }

  private int minute() {
    return now().get(Calendar.MINUTE);
  }

  private GregorianCalendar now() {
    return new GregorianCalendar(TimeZone.getTimeZone("UTC"));
  }

  private String pad1(int x) {
    if (x < 10) return "0" + x;
    return "" + x;
  }

  private float timeInRadians(float hours, float minutes) {
    return TAU * (hours / 24 + minutes / (60 * 24));
  }
}
