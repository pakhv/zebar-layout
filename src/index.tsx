/* @refresh reload */
import './index.css';
import './nerd-font/nerd-font.css';
import { render } from 'solid-js/web';
import { createStore } from 'solid-js/store';
import * as zebar from 'zebar';

const providers = zebar.createProviderGroup({
  network: { type: 'network' },
  glazewm: { type: 'glazewm' },
  cpu: { type: 'cpu' },
  date: { type: 'date', formatting: 'EEE d MMM HH:mm:ss' },
  battery: { type: 'battery' },
  memory: { type: 'memory' },
  weather: { type: 'weather' },
});

render(() => <App />, document.getElementById('root')!);

function App() {
  const [output, setOutput] = createStore(providers.outputMap);

  providers.onOutput(outputMap => setOutput(outputMap));

  // Get icon to show for how much of the battery is charged.
  function getBatteryIcon(batteryOutput) {
    if (batteryOutput.chargePercent > 90)
      return <i class="nf nf-fa-battery_4"></i>;
    if (batteryOutput.chargePercent > 70)
      return <i class="nf nf-fa-battery_3"></i>;
    if (batteryOutput.chargePercent > 40)
      return <i class="nf nf-fa-battery_2"></i>;
    if (batteryOutput.chargePercent > 20)
      return <i class="nf nf-fa-battery_1"></i>;
    return <i class="nf nf-fa-battery_0"></i>;
  }

  // Get icon to show for current weather status.
  function getWeatherIcon(weatherOutput) {
    switch (weatherOutput.status) {
      case 'clear_day':
        return <i class="nf nf-weather-day_sunny"></i>;
      case 'clear_night':
        return <i class="nf nf-weather-night_clear"></i>;
      case 'cloudy_day':
        return <i class="nf nf-weather-day_cloudy"></i>;
      case 'cloudy_night':
        return <i class="nf nf-weather-night_alt_cloudy"></i>;
      case 'light_rain_day':
        return <i class="nf nf-weather-day_sprinkle"></i>;
      case 'light_rain_night':
        return <i class="nf nf-weather-night_alt_sprinkle"></i>;
      case 'heavy_rain_day':
        return <i class="nf nf-weather-day_rain"></i>;
      case 'heavy_rain_night':
        return <i class="nf nf-weather-night_alt_rain"></i>;
      case 'snow_day':
        return <i class="nf nf-weather-day_snow"></i>;
      case 'snow_night':
        return <i class="nf nf-weather-night_alt_snow"></i>;
      case 'thunder_day':
        return <i class="nf nf-weather-day_lightning"></i>;
      case 'thunder_night':
        return <i class="nf nf-weather-night_alt_lightning"></i>;
    }
  }

  return (
    <div class="app">
      <div class="left">
        {
          output.glazewm && (
            <div class="workspaces widgets-container">
              {output.glazewm.currentWorkspaces.map(workspace => (
                <button
                  class={`workspace ${workspace.hasFocus && 'focused'} ${workspace.isDisplayed && 'displayed'}`}
                  onClick={() =>
                    output.glazewm.runCommand(
                      `focus --workspace ${workspace.name}`,
                    )
                  }
                >
                  {workspace.displayName ?? workspace.name}
                </button>
              ))}
            </div>
          )
        }
      </div>

      <div class="center widgets-container">
        <div class="date-time-container">{output.date?.formatted ?? "Not available"}</div>
      </div>

      <div class="right widgets-container">
        {output.glazewm && (
          <>
            <button
              class={`tiling-direction nf ${output.glazewm.tilingDirection === 'horizontal' ? 'nf-md-swap_horizontal' : 'nf-md-swap_vertical'}`}
              onClick={() =>
                output.glazewm.runCommand('toggle-tiling-direction')
              }
            ></button>
          </>
        )}

        {output.memory && (
          <div class="memory">
            <i class="nf nf-fae-chip"></i>
            {Math.round(output.memory.usage)}%
          </div>
        )}

        {output.cpu && (
          <div class="cpu">
            <i class="nf nf-oct-cpu"></i>

            {/* Change the text color if the CPU usage is high. */}
            <span
              class={output.cpu.usage > 85 ? 'high-usage' : ''}
            >
              {Math.round(output.cpu.usage)}%
            </span>
          </div>
        )}

        {output.battery && (
          <div class="battery">
            {/* Show icon for whether battery is charging. */}
            {output.battery.isCharging && (
              <i class="nf nf-md-power_plug charging-icon"></i>
            )}
            {getBatteryIcon(output.battery)}
            {Math.round(output.battery.chargePercent)}%
          </div>
        )}

        {output.weather && (
          <div class="weather">
            {getWeatherIcon(output.weather)}
            {Math.round(output.weather.celsiusTemp)}°C
          </div>
        )}
      </div>
    </div>
  );
}