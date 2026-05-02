-- Allow businesses to read basic info of pros who applied to their shifts
CREATE POLICY "users_select_business_applicants" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN shifts s ON s.id = a.shift_id
      WHERE a.pro_id = users.id
        AND s.business_id = auth.uid()
    )
  );

-- Allow businesses to read experiences of pros who applied to their shifts
CREATE POLICY "pro_experiences_select_business" ON pro_experiences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM applications a
      JOIN shifts s ON s.id = a.shift_id
      WHERE a.pro_id = pro_experiences.pro_id
        AND s.business_id = auth.uid()
    )
  );
