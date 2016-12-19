class CreateSessions < ActiveRecord::Migration
  def change
    create_table :sessions do |t|
      t.string :session_uuid
      t.datetime :expiry
      t.boolean :on_campus
      t.boolean :is_mobile

      t.timestamps
    end
  end
end
